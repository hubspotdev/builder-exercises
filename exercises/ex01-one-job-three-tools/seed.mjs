// Creates three open EX01 deals with no activity, owned by the first owner in the account.
import { hubspot } from "../../shared/hubspot.mjs";

const owners = await hubspot("/crm/owners/2026-09");
const ownerId = owners.results?.[0]?.id;

for (const name of ["EX01 Acme renewal", "EX01 Globex pilot", "EX01 Initech expansion"]) {
  await hubspot("/crm/objects/2026-09/deals", {
    method: "POST",
    body: {
      properties: {
        dealname: name,
        pipeline: "default",
        dealstage: "appointmentscheduled",
        hubspot_owner_id: ownerId,
      },
    },
  });
  console.log(`Created ${name}`);
}
