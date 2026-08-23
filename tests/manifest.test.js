const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.json"), "utf8"));

function referencedFiles(value, files = []) {
  if (typeof value === "string") {
    if (/\.(?:js|css|html|png|otf)$/i.test(value)) files.push(value);
    return files;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => referencedFiles(item, files));
    return files;
  }

  if (value && typeof value === "object") {
    Object.values(value).forEach((item) => referencedFiles(item, files));
  }

  return files;
}

test("uses Manifest V3", () => {
  assert.equal(manifest.manifest_version, 3);
});

test("declares the storage permission used for reading preferences", () => {
  assert.ok(manifest.permissions.includes("storage"));
});

test("all local files referenced by the manifest exist", () => {
  const files = [...new Set(referencedFiles(manifest))];
  assert.ok(files.length > 0);

  for (const file of files) {
    assert.ok(fs.existsSync(path.join(root, file)), `Missing manifest resource: ${file}`);
  }
});
