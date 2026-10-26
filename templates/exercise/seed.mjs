// Creates the sample records for this exercise. Tag every record name with the exercise tag.
import { hubspot } from "../../shared/hubspot.mjs";

const TAG = "EXNN";

// Example: create one deal
await hubspot("/crm/v3/objects/deals", {
  method: "POST",
  body: { properties: { dealname: `${TAG} Example deal` } },
});
console.log(`Created ${TAG} Example deal`);
