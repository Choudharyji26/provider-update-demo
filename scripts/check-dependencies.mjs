import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("package.json", "utf8"));
const list = JSON.parse(
  execFileSync("pnpm", ["list", "--depth=0", "--json"], {
    encoding: "utf8",
    env: process.env,
  }),
);

assert.equal(process.version, "v24.18.0");
assert.equal(
  execFileSync("pnpm", ["--version"], {
    encoding: "utf8",
    env: process.env,
  }).trim(),
  "11.15.1",
);
assert.deepEqual(Object.keys(manifest).sort(), [
  "dependencies",
  "name",
  "private",
  "scripts",
  "type",
]);
assert.deepEqual(Object.keys(manifest.dependencies).sort(), [
  "@biomejs/biome",
  "@types/node",
  "@types/react",
  "better-auth",
  "resend",
  "stripe",
  "typescript",
]);

const installed = list[0];
assert.ok(installed);
assert.equal(installed.dependencies["better-auth"].version, "1.6.23");
assert.equal(installed.dependencies.resend.version, "6.17.0");
assert.equal(installed.dependencies["@biomejs/biome"].version, "2.5.4");
assert.equal(installed.dependencies["@types/node"].version, "24.13.3");
assert.equal(installed.dependencies["@types/react"].version, "19.2.17");
assert.equal(installed.dependencies.typescript.version, "6.0.3");

const stripeRequirement = manifest.dependencies.stripe;
const stripeVersion = installed.dependencies.stripe.version;
if (stripeRequirement === "^20.3.0") {
  assert.equal(stripeVersion, "20.4.1");
} else {
  assert.equal(stripeRequirement, ">=21.0.1 <22.0.0");
  assert.match(stripeVersion, /^21\.(?:0\.(?:[1-9][0-9]*)|(?:[1-9][0-9]*)\.[0-9]+)(?:-|$)/u);
}

process.stdout.write("Dependency manifest, lockfile, install, and toolchain agree.\n");
