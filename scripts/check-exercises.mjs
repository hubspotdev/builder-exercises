// Checks that every exercise folder has the required files and metadata, and that tags are unique.
// Runs in CI on every pull request. Usage: npm run check
import { readdirSync, existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const REQUIRED_FILES = ["README.md", "exercise.json", "cleanup.mjs"];
const REQUIRED_FIELDS = ["id", "tag", "title", "minutes", "interfaces", "status"];
const INTERFACES = ["mcp", "agent-cli", "api"];
const STATUSES = ["draft", "published", "retired"];
const REQUIRED_SECTIONS = ["## Before you start", "## Steps", "## Clean up", "## Keep going"];

const root = new URL("../exercises/", import.meta.url).pathname;
const errors = [];
const tags = new Map();

for (const dir of readdirSync(root, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  const folder = join(root, dir.name);
  const where = `exercises/${dir.name}`;

  for (const file of REQUIRED_FILES) {
    if (!existsSync(join(folder, file))) errors.push(`${where}: missing ${file}`);
  }
  if (!existsSync(join(folder, "exercise.json"))) continue;

  const meta = JSON.parse(readFileSync(join(folder, "exercise.json"), "utf8"));
  for (const field of REQUIRED_FIELDS) {
    if (meta[field] === undefined) errors.push(`${where}: exercise.json is missing "${field}"`);
  }
  if (!dir.name.startsWith(`${meta.id}-`)) errors.push(`${where}: folder name should start with "${meta.id}-"`);
  if (meta.minutes > 15) errors.push(`${where}: exercises must take 15 minutes or less`);
  if (!STATUSES.includes(meta.status)) errors.push(`${where}: status must be one of ${STATUSES.join(", ")}`);
  for (const i of meta.interfaces ?? []) {
    if (!INTERFACES.includes(i)) errors.push(`${where}: unknown interface "${i}"`);
  }
  if (meta.status === "published" && !meta.lastVerified) {
    errors.push(`${where}: published exercises need a lastVerified date`);
  }
  if (tags.has(meta.tag)) errors.push(`${where}: tag ${meta.tag} is already used by ${tags.get(meta.tag)}`);
  tags.set(meta.tag, where);

  const readme = existsSync(join(folder, "README.md")) ? readFileSync(join(folder, "README.md"), "utf8") : "";
  for (const section of REQUIRED_SECTIONS) {
    if (!readme.includes(section)) errors.push(`${where}: README is missing "${section}"`);
  }
  if (meta.status === "published" && readme.includes("TODO")) {
    errors.push(`${where}: published exercises can't contain TODOs`);
  }
}

if (errors.length) {
  console.error(errors.map((e) => `✗ ${e}`).join("\n"));
  process.exit(1);
}
console.log(`✓ ${tags.size} exercise(s) passed`);
