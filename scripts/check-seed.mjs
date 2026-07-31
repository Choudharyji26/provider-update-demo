import assert from "node:assert/strict";
import { lstat, readFile } from "node:fs/promises";

const manifest = JSON.parse(await readFile("seed-manifest.json", "utf8"));
const packageManifest = JSON.parse(await readFile("package.json", "utf8"));

assert.equal(manifest.schema, "pramaan/provider-update-demo-seed/v1");
assert.deepEqual(manifest.repository, {
  owner: "Pramaan-Dev",
  name: "provider-update-demo",
  remote: "https://github.com/Pramaan-Dev/provider-update-demo.git",
  baseRef: "main",
  headPattern: "product-loop/live-demo-*",
});
assert.equal(manifest.hero.provider, "stripe");
assert.equal(manifest.hero.change, "stripe-node.decimal-string-v21");
assert.equal(manifest.hero.capability, "provider.update");
assert.equal(manifest.hero.environment, "sandbox");
assert.equal(
  manifest.hero.bundleDigest,
  "sha256/v1$42814155a4a9dc18e2c8cec0f6de941c21de9cc90c88cd73a3c88792c1d2e5c6",
);
assert.equal(manifest.hero.verificationProfile, "provider-update-alpha-stripe-v1");
assert.equal(
  manifest.hero.verificationDigest,
  "sha256/v1$d4d2b8f76d4557e523a95e9196de31c10723c6a9a5d00a0db2077c608ec62f56",
);
assert.equal(packageManifest.dependencies.stripe, manifest.baseline.stripeRequirement);
assert.equal(await readFile(".node-version", "utf8"), `${manifest.baseline.node}\n`);
assert.equal(
  await readFile(".tool-versions", "utf8"),
  `nodejs ${manifest.baseline.node}\npnpm 11.15.1\n`,
);
assert.equal(manifest.baseline.verificationCommand, "pnpm test");
assert.equal(manifest.expectedUpdate.stripeRequirement, ">=21.0.1 <22.0.0");

const affected = manifest.expectedUpdate.affectedPaths;
const untouched = manifest.expectedUpdate.untouchedPaths;
assert.deepEqual(affected, [
  "src/analytics/checkout-conversion-rate.ts",
  "src/billing/checkout-settlement-rate.ts",
]);
assert.deepEqual(untouched, [
  "src/auth/dashboard-auth.ts",
  "src/notifications/send-dashboard-invite.ts",
  "src/payments/observe-payment-status.ts",
]);
assert.equal(
  affected.some((path) => untouched.includes(path)),
  false,
);

for (const file of affected) {
  assert.ok((await lstat(file)).isFile());
  const source = await readFile(file, "utf8");
  assert.match(source, /^import Stripe from "stripe";/u);
  assert.match(source, /session: Stripe\.Checkout\.Session/u);
  assert.match(source, /return session\.currency_conversion\?\.fx_rate;/u);
}

const unaffectedStripe = await readFile("src/payments/observe-payment-status.ts", "utf8");
assert.match(unaffectedStripe, /Stripe\.PaymentIntent/u);
assert.doesNotMatch(unaffectedStripe, /currency_conversion|fx_rate/u);

for (const file of untouched.slice(0, 2)) {
  const source = await readFile(file, "utf8");
  assert.doesNotMatch(source, /currency_conversion|fx_rate/u);
}

process.stdout.write("Seed identity and bounded Stripe impact match the deterministic manifest.\n");
