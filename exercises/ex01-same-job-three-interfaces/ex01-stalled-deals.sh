#!/usr/bin/env bash
# Agent CLI version: find open EX01 deals with no logged activity in the last 14 days
# (or none at all) and create a follow-up task on each, owned by the deal owner,
# due tomorrow, associated with the deal. Safe to re-run: deals that already have an
# open "Follow up (CLI)" task are skipped.
#
# Usage: ex01-stalled-deals.sh [--dry-run]
set -euo pipefail

DRY_RUN=""
case "${1:-}" in
  "") ;;
  --dry-run) DRY_RUN="--dry-run" ;;
  *) echo "Usage: $0 [--dry-run]" >&2; exit 2 ;;
esac

LOOKBACK_DAYS=14
TASK_TO_DEAL_ASSOCIATION_TYPE_ID=216
SUBJECT_PREFIX="Follow up (CLI): "

if date -v-1d +%Y-%m-%d >/dev/null 2>&1; then
  cutoff=$(date -v-"${LOOKBACK_DAYS}"d +%Y-%m-%d)
  due_ms=$(( $(date -v+1d +%s) * 1000 ))
else
  cutoff=$(date -d "${LOOKBACK_DAYS} days ago" +%Y-%m-%d)
  due_ms=$(( $(date -d "tomorrow" +%s) * 1000 ))
fi

workdir=$(mktemp -d)
trap 'rm -rf "$workdir"' EXIT

# Two filter groups (OR'd): last activity older than the cutoff, or no activity at all.
hubspot objects search --type deals \
  --filter "dealname~EX01 AND hs_is_closed!=true AND notes_last_updated<${cutoff}" \
  --filter "dealname~EX01 AND hs_is_closed!=true AND !notes_last_updated" \
  --properties dealname,hubspot_owner_id,notes_last_updated \
  --format jsonl > "$workdir/deals.jsonl"

# Duplicate guard: skip deals that already have an open "Follow up (CLI)" task.
# Open means any status except COMPLETED/DEFERRED, including an empty status.
hubspot objects search --type tasks \
  --filter "hs_task_subject~CLI AND hs_task_status@!=COMPLETED,DEFERRED" \
  --filter "hs_task_subject~CLI AND !hs_task_status" \
  --properties hs_task_subject \
  --format jsonl > "$workdir/open-tasks.jsonl"

jq -c --slurpfile open "$workdir/open-tasks.jsonl" \
  --arg prefix "$SUBJECT_PREFIX" \
  'select(($prefix + .properties.dealname) as $subject
          | any($open[]; .properties.hs_task_subject == $subject) | not)' \
  "$workdir/deals.jsonl" > "$workdir/new-deals.jsonl"

found=$(wc -l < "$workdir/deals.jsonl" | tr -d ' ')
count=$(wc -l < "$workdir/new-deals.jsonl" | tr -d ' ')
echo "Stalled EX01 deals (no activity since ${cutoff}): ${found}; skipping $(( found - count )) with an open follow-up task" >&2
if [ "$count" -eq 0 ]; then
  exit 0
fi

jq -c --arg prefix "$SUBJECT_PREFIX" --argjson due "$due_ms" --argjson assoc "$TASK_TO_DEAL_ASSOCIATION_TYPE_ID" '{
  properties: ({
    hs_task_subject: ($prefix + .properties.dealname),
    hs_task_status: "NOT_STARTED",
    hs_timestamp: ($due | tostring)
  } + (if .properties.hubspot_owner_id then {hubspot_owner_id: .properties.hubspot_owner_id} else {} end)),
  associations: [{
    to: {id: .id},
    types: [{associationCategory: "HUBSPOT_DEFINED", associationTypeId: $assoc}]
  }]
}' "$workdir/new-deals.jsonl" > "$workdir/tasks.jsonl"

if [ -n "$DRY_RUN" ]; then
  jq -r '"  deal \(.associations[0].to.id): \(.properties.hs_task_subject) | owner \(.properties.hubspot_owner_id // "unassigned") | due \((.properties.hs_timestamp | tonumber / 1000 | todate))"' \
    "$workdir/tasks.jsonl" >&2
fi

# shellcheck disable=SC2086
hubspot objects create --type tasks $DRY_RUN < "$workdir/tasks.jsonl"
