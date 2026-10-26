// Minimal HubSpot API helper shared by every exercise. No dependencies.
export const BASE = "https://api.hubapi.com";

const token = process.env.HUBSPOT_TOKEN;
if (!token) {
  console.error("HUBSPOT_TOKEN is not set. Set it to your service key; see the exercise's Before you start section.");
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
};

// Call a HubSpot API path and return parsed JSON (or null for empty responses).
export async function hubspot(path, { method = "GET", body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed with ${res.status}: ${text}`);
  }
  return res.status === 204 ? null : res.json();
}

// Delete every record of the given object types whose name property contains the exercise tag.
// Each exercise tags its records (for example EX01) so cleanup never touches anything else.
export async function removeTagged(tag, targets) {
  for (const { type, nameProperty } of targets) {
    const found = await hubspot(`/crm/objects/2026-09/${type}/search`, {
      method: "POST",
      body: {
        filterGroups: [{ filters: [{ propertyName: nameProperty, operator: "CONTAINS_TOKEN", value: tag }] }],
        limit: 100,
      },
    });
    for (const record of found.results ?? []) {
      await hubspot(`/crm/objects/2026-09/${type}/${record.id}`, { method: "DELETE" });
      console.log(`Deleted ${type} ${record.id}`);
    }
  }
}
