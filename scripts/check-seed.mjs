import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
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
assert.ok(
  [manifest.baseline.stripeRequirement, manifest.expectedUpdate.stripeRequirement].includes(
    packageManifest.dependencies.stripe,
  ),
);
assert.equal(await readFile(".node-version", "utf8"), `${manifest.baseline.node}\n`);
assert.equal(await readFile(".nvmrc", "utf8"), `${manifest.baseline.node}\n`);
assert.equal(
  await readFile(".tool-versions", "utf8"),
  `nodejs ${manifest.baseline.node}\npnpm 11.15.1\n`,
);
assert.equal(manifest.baseline.verificationCommand, "pnpm test");
assert.equal(manifest.expectedUpdate.stripeRequirement, ">=21.0.1 <22.0.0");
assert.deepEqual(manifest.baseline.testPaths, [
  "tests/analytics-rate.test.ts",
  "tests/billing-rate.test.ts",
  "tests/dashboard-auth.test.ts",
  "tests/dashboard-invite.test.ts",
  "tests/payment-status.test.ts",
]);

for (const file of manifest.baseline.testPaths) {
  assert.ok((await lstat(file)).isFile());
}

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
assert.deepEqual(manifest.expectedUpdate.automaticPatchPaths, ["package.json"]);
assert.deepEqual(manifest.expectedUpdate.manualVerificationPaths, [
  "pnpm-lock.yaml",
  "tests/analytics-rate.test.ts",
  "tests/billing-rate.test.ts",
  "tests/support/stripe.ts",
]);
assert.equal(
  affected.some((path) => untouched.includes(path)),
  false,
);

const applicationSourceSha256 = {
  "src/analytics/checkout-conversion-rate.ts":
    "8baaae92ade94e71e8b5acb75da2a4222ab46f6955a2c9b78ff4cd9f8565ac7d",
  "src/auth/dashboard-auth.ts": "0b8194dff0b8a78ed8fda5d292495b0cd57eaa742f3297b63f036eb80a9fe990",
  "src/billing/checkout-settlement-rate.ts":
    "e0c953f9fa841baf05f52d76a458cd5418c6af46befb360ea5c36157d3c73090",
  "src/notifications/send-dashboard-invite.ts":
    "942758b5273c9e8ddbfb4108a9ce1ed4d6daac95d6f48e21d8fc28f762644e40",
  "src/payments/observe-payment-status.ts":
    "ba29054c1155beb4ae245e7d24fe890e27f7fe61102c5801a5af42de9edf6a4c",
};
assert.deepEqual(manifest.expectedUpdate.applicationSourceSha256, applicationSourceSha256);

for (const [file, expectedDigest] of Object.entries(applicationSourceSha256)) {
  const source = await readFile(file, "utf8");
  assert.equal(createHash("sha256").update(source).digest("hex"), expectedDigest);
}

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

const analyticsTest = await readFile("tests/analytics-rate.test.ts", "utf8");
const billingTest = await readFile("tests/billing-rate.test.ts", "utf8");
const stripeDouble = await readFile("tests/support/stripe.ts", "utf8");

if (packageManifest.dependencies.stripe === manifest.baseline.stripeRequirement) {
  assert.match(analyticsTest, /assert\.equal\(analyticsConversionRate\(session\), "0\.9243"\);/u);
  assert.match(billingTest, /assert\.equal\(checkoutSettlementRate\(session\), "1\.0835"\);/u);
  assert.match(stripeDouble, /^import type Stripe from "stripe";/u);
  assert.match(stripeDouble, /fxRate: CheckoutFxRate/u);
  assert.doesNotMatch(stripeDouble, /Decimal\.from/u);
} else {
  assert.match(
    analyticsTest,
    /assert\.equal\(analyticsConversionRate\(session\)\?\.toString\(\), "0\.9243"\);/u,
  );
  assert.match(
    billingTest,
    /assert\.equal\(checkoutSettlementRate\(session\)\?\.toString\(\), "1\.0835"\);/u,
  );
  assert.match(stripeDouble, /^import Stripe from "stripe";/u);
  assert.match(stripeDouble, /fx_rate: Stripe\.Decimal\.from\(fxRate\)/u);

  const changedPaths = execFileSync(
    "git",
    ["diff", "--name-only", "--relative", "refs/heads/main", "--"],
    { encoding: "utf8" },
  )
    .trim()
    .split("\n")
    .filter(Boolean)
    .sort();
  const expectedChangedPaths = [
    ...manifest.expectedUpdate.automaticPatchPaths,
    ...manifest.expectedUpdate.manualVerificationPaths,
  ].sort();
  assert.deepEqual(changedPaths, expectedChangedPaths);
}

const untrackedPaths = execFileSync("git", ["ls-files", "--others", "--exclude-standard"], {
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);
assert.deepEqual(untrackedPaths, []);

process.stdout.write("Seed identity and bounded Stripe impact match the deterministic manifest.\n");
