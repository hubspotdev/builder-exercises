# Same job, three ways in: follow up on stalled deals

**Time:** about 10–12 minutes, after setup. **You'll use:** the HubSpot connector in Claude (MCP), Agent CLI, the CRM APIs, and Claude Cowork scheduled tasks. **You'll end up with:** a saved prompt, a reusable CLI script, a small API script, and a scheduled task that runs every weekday, plus a clear sense of which to reach for next time.

Line up follow-ups on deals that have gone quiet, so they're waiting for your reps every morning. You'll have your agent do the job two ways, look at the API calls underneath, then put it on a schedule: find open deals with no activity in the last 14 days, and create a follow-up task on each for the deal owner. Same job, same account, same result. What changes is how much you write, how much you control, and how often it can run without you.

**Pick your path.** Prompts only (no repo or code): do steps 1, 2 and 5, using the "No repo?" options in step 1 and Clean up. Full version: do every step, including Agent CLI and the API scripts.

## Before you start (setup, not timed)

- A free HubSpot developer test account. Don't use a production account: this exercise creates and deletes records.
- Claude with the HubSpot connector installed and connected to that test account. Step 5 also uses Claude Cowork scheduled tasks, so you'll need a Claude plan that includes Cowork.

- Claude Code (or Codex) with Agent CLI installed and authenticated to the same account (full version only). To install it, run the following command in your terminal:

  ```
  curl -fsSL https://api.hubapi.com/hub/cli/backend/hub-cli/latest/install.sh | sh
  ```

  Then, open a new terminal and run the following commands:

  ```
  unset HUBSPOT_ACCESS_TOKEN
  hubspot auth login
  hubspot whoami
  ```

  In the same terminal, run the following command and select all skills:

  ```
  npx skills add hubspot/agent-cli-skills
  ```

  After you select your skills, choose your applicable Agent.

  Finally, choose your Installation scope and method: we recommend you choose Project and Symlink.

  You will then be asked to complete your installation for the Agent CLI.

- Node.js 18 or later (full version only), and a service key for the test account with exactly these scopes: `crm.objects.deals.read`, `crm.objects.deals.write`, `crm.objects.contacts.read`, `crm.objects.contacts.write` and `crm.objects.owners.read`. To create one, go to Development, then Keys > Service keys, and click Create service key. Save it as an environment variable via your terminal with the following command:

  ```
  export HUBSPOT_TOKEN={your-service-key}
  ```

  Note: copy/paste your service key in the command prompt above once you've created the service key.

- The starter repo (full version only), cloned and open in your terminal:

  ```
  git clone https://github.com/hubspotdev/builder-exercises.git && cd builder-exercises/exercises/ex01-same-job-three-interfaces
  ```

  It contains the following files: `seed.mjs`, `stalled-deals.mjs` (the API script) and `cleanup.mjs`. Step 3 creates `cli/ex01-stalled-deals.sh` (the Agent CLI script). Every record in this exercise will start with `EX01`, so it's easy to find and remove.

The Node scripts use `HUBSPOT_TOKEN` (the service key) and Agent CLI uses OAuth through `hubspot auth login`. They are kept separate on purpose, because Agent CLI reads `HUBSPOT_ACCESS_TOKEN` and would switch to admin mode if it found one.

## Steps

### 1. Create the sample deals (1 minute)

**No repo?** Paste this prompt into your agent of choice (we'll use Claude) once you've connected your HubSpot account, instead of running `seed.mjs`:

```
Create three open deals in my default pipeline named "EX01 Acme renewal", "EX01 Initech expansion" and "EX01 Globex pilot", each owned by me. Don't log any activity on them.
```

Otherwise, in the starter repo within the folder `ex01-same-job-three-interfaces`, access your terminal and run the following command:

```
node seed.mjs
```

**You should see:** three "Created EX01" lines, and three EX01 deals in your pipeline with no activity.

You should now be able to view the deals in your test account in HubSpot.

### 2. Do it in chat with MCP (3 minutes)

In Claude, with the HubSpot connector on and connected to your test account that you authenticated with earlier, paste the following prompt:

```
Find my open deals whose names start with EX01 and that have no logged activity in the last 14 days, including deals with no activity at all. List them first. Then, for each one, create a task titled "Follow up (MCP): <deal name>", assigned to the deal owner and due tomorrow.
```

Check the list, then approve the tasks and ask the agent to create them. **You should see:** three tasks marked (MCP), one on each deal within both your Claude instance and your HubSpot account.

**Use MCP when** you want an answer or an action right now, in conversation, with a person reviewing each change. No code, and new connector capabilities show up without any work on your side.

### 3. Run and change a script with Agent CLI (3 minutes)

Using the agent you installed earlier when executing `npx skills add hubspot/agent-cli-skills` (we're using Claude Code in this example), run the following prompt to generate a script, first as a dry run, then for real:

```
Use only HubSpot Agent CLI commands run in the terminal (hubspot …). Don't use the HubSpot MCP connector or curl.

Find my open deals whose names start with EX01 and whose notes_last_updated is more than 14 days ago or empty. Search with CONTAINS_TOKEN "EX01", then keep only names that start with EX01.

For each deal, create a task titled "Follow up (CLI): <deal name>", due tomorrow, with hubspot_owner_id set to the deal's hubspot_owner_id. Associate each task with its deal. Leave priority and status at their defaults.

Show me a dry run first and wait for my OK. Then create the tasks in one batch and save the commands as cli/ex01-stalled-deals.sh, with a --dry-run flag, so I can rerun it.
```

**You should see:** a plan table listing the three deals and their titles, then three tasks marked (CLI). If you see (MCP) calls instead of `hubspot` commands, Claude Code is using the HubSpot connector from step 2: turn off the claude.ai HubSpot server with `/mcp`, then run the prompt again.

Now ask your agent (ours is Claude Code) for a change, the way you would adjust it for your own pipeline:

```
Change cli/ex01-stalled-deals.sh to look back 7 days instead of 14. Show me the diff, but don't run it.
```

**You should see:** a one-line change to the script.

**Use Agent CLI when** the work is repetitive, bulk or scheduled. The logic is written once and saved as a script, so later runs don't spend agent reasoning on every record, and small changes are quick.

### 4. Look under the hood at the API calls (2 minutes)

Claude and Agent CLI both did this job by calling HubSpot's CRM APIs. Run the direct version to see those calls from `exercises/ex01-same-job-three-interfaces/` in the repo:

```
node stalled-deals.mjs
```

**You should see:** three "Created task" lines in your terminal.

Open `stalled-deals.mjs` and look at the two parts that do the work. The search filter decides exactly which deals count as stalled:

```js
// 1. The search filter decides exactly which deals count as stalled
const search = await hubspot("/crm/objects/2026-09/deals/search", {
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
```

And the association links each new task to its deal:

```js
associations: [
  { to: { id: deal.id }, types: [{ associationCategory: "HUBSPOT_DEFINED", associationTypeId: 216 }] },
],
```

Finally, open any EX01 deal in HubSpot. **You should see:** three follow-up tasks, marked (MCP), (CLI) and (API). The result was the same each time; what changed was how much you wrote and how much each run depended on you.

**Reach for the APIs directly** when a job needs to run as a fixed, controlled integration, with every filter and field defined in code. For most jobs, your agent makes these calls for you through the connector or Agent CLI.

### 5. Put it on a schedule in Cowork (2 minutes)

In Claude Cowork, click **Scheduled** in the left sidebar, click **New task**, then choose **Set up manually**. Fill in the form:

- **Task name:** EX01 stalled deal follow-ups
- **Prompt:** Find my open deals whose names start with EX01 and that have no logged activity in the last 14 days, including deals with no activity at all. For each one, create a task titled "Follow up (Scheduled): \<deal name\>", assigned to the deal owner and due today.
- **Approval mode:** Automatically approve
- **Frequency:** On weekdays (or whichever cadence you choose)

Click **Save**. To see it work without waiting for tomorrow, run the task on demand from the Scheduled tasks page.

**You should see:** a completed run on the Scheduled tasks page, and three new tasks marked (Scheduled), one on each EX01 deal.

**Use a scheduled task** when the same check should happen without you asking. It uses the same HubSpot connector as step 2 and runs remotely, so it fires even when your computer is asleep.

## What happened under the hood

All three ways in read and wrote the same deals and tasks in the same CRM. The scheduled task in step 5 uses the connector, so it follows the MCP column. What differed was the access model.

The public APIs are the foundation layer that MCP and Agent CLI are built on. Step 4 shows that layer directly: one call to the CRM search endpoint to find the deals, and one call per deal to the tasks endpoint to create an associated task.

## Clean up

In Cowork, open **Scheduled** and delete the **EX01 stalled deal follow-ups** task, so it stops creating new tasks.

In the starter repo, run `node cleanup.mjs`. It deletes all EX01 tasks and deals. **You should see:** a "Deleted" line for each record.

**No repo?** In HubSpot, search your deals and tasks for EX01, select them, and delete them.

Delete the `builder-exercises` folder if you don't plan to reuse the scripts. If you created the service key only for this exercise, delete it or rotate it.

## Keep going

- **MCP:** drop the EX01 filter and save the step 2 prompt as Claude Project instructions to make it a weekly pipeline review.
- **Agent CLI:** remove the EX01 filter, change the 14-day window to match your sales cycle, and run the script on a schedule so the tasks are waiting each morning.
- **APIs:** if this job has to run as a fixed integration, start from the search filter and association in step 4 using the CRM Search API documentation.

Not sure which to pick? Start in chat with your agent. Once it's worth running every day, schedule it in Claude Cowork like step 5, or move it to Agent CLI for bulk work.

## Troubleshooting

| If you see | Try this |
| --- | --- |
| Claude finds no deals | The tag in the prompt must match the seeded deals (`EX01`). If you just ran `seed.mjs`, wait about 20 seconds and try again. |
| `Found 0 stalled EX01 deals` | If you haven't run `node seed.mjs` yet, or you ran cleanup, seed the deals first. If you just seeded, wait a few seconds and run it again, since new deals can take a moment to appear in search. |
| `HUBSPOT_TOKEN is not set` | You exported the key under a different name. Run `export HUBSPOT_TOKEN=your-service-key`. |
| The CLI acts with broader permissions than expected | `HUBSPOT_ACCESS_TOKEN` is set. Run `unset HUBSPOT_ACCESS_TOKEN`. |
| A script fails with 403 | The service key is missing a scope. Edit the key and add it. |
| Claude returns only some deals | The connector returns a limited number of records per request. Keep the EX01 filter, or use Agent CLI or the APIs for bulk work. |
| You see (MCP) calls instead of `hubspot` commands in step 3 | Claude Code is using the HubSpot connector. Turn off the claude.ai HubSpot server with `/mcp`, then run the prompt again. |
