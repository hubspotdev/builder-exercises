// Deletes every record this exercise created. List dependent objects (tasks, notes) before their parents.
import { removeTagged } from "../../shared/hubspot.mjs";

await removeTagged("EXNN", [
  { type: "deals", nameProperty: "dealname" },
]);
