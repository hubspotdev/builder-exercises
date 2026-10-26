// Deletes every EX01 task, then every EX01 deal. Tasks first, because deleting a deal doesn't delete its tasks.
import { removeTagged } from "../../shared/hubspot.mjs";

await removeTagged("EX01", [
  { type: "tasks", nameProperty: "hs_task_subject" },
  { type: "deals", nameProperty: "dealname" },
]);
