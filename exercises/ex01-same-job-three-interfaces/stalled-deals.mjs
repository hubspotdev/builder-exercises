// The API version: find open EX01 deals with no activity in 14 days and create a follow-up task on each.
import { hubspot } from "../../shared/hubspot.mjs";

const DAY = 24 * 60 * 60 * 1000;
const cutoff = Date.now() - 14 * DAY;
const due = new Date(Date.now() + DAY).toISOString();

const open = { propertyName: "hs_is_closed", operator: "EQ", value: "false" };
const ours = { propertyName: "dealname", operator: "CONTAINS_TOKEN", value: "EX01" };

// 1. The search filter decides exactly which deals count as stalled
const search = await hubspot("/crm/v3/objects/deals/search", {
  method: "POST",
  body: {
    filterGroups: [
      { filters: [open, ours, { propertyName: "notes_last_updated", operator: "LT", value: String(cutoff) }] },
      { filters: [open, ours, { propertyName: "notes_last_updated", operator: "NOT_HAS_PROPERTY" }] },
    ],
    properties: ["dealname", "hubspot_owner_id"],
    limit: 100,
  },
});

// 2. The association links each new task to its deal
for (const deal of search.results ?? []) {
  await hubspot("/crm/v3/objects/tasks", {
    method: "POST",
    body: {
      properties: {
        hs_task_subject: `Follow up (API): ${deal.properties.dealname}`,
        hs_timestamp: due,
        hs_task_status: "NOT_STARTED",
        hubspot_owner_id: deal.properties.hubspot_owner_id,
      },
      associations: [
        { to: { id: deal.id }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 216 }] }, // TODO: confirm ID
      ],
    },
  });
  console.log(`Created task for ${deal.properties.dealname}`);
}
