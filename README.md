# Metric Harbor provider-update demo

Metric Harbor is a deliberately small TypeScript SaaS fixture for the Pramaan/Product Loop
`provider.update` demo. It reads Stripe Checkout conversion data in billing and analytics, observes
an unrelated PaymentIntent status, prepares dashboard email through a Resend-shaped seam, and
builds Better Auth options through an injected callable matching `betterAuth(options)`. Tests use
inert SDK-shaped doubles. The application test subprocess runs with Node's network permission
disabled, so those tests cannot contact Stripe, Resend, Better Auth infrastructure, GitHub, or any
other external system.

The payment module reports provider status with `completionClaimed: false`. The email module never
claims delivery. There are no credentials, provider objects from real accounts, or customer data in
the seed.

## Run the baseline

Use exactly Node `24.18.0` and pnpm `11.15.1`:

```sh
pnpm install --frozen-lockfile
pnpm test
```

`pnpm test` runs formatting, lint, syntax parsing, strict application typechecking, network-denied
tests, an offline frozen-lock dependency check, secret-shape scanning, deterministic seed checks,
and a package dry run. `skipLibCheck` is limited to third-party declarations because Better Auth's
cross-runtime types reference optional Bun and Cloudflare modules; all application and test code
remains under strict checking.

The pinned Product Loop alpha accepts a closed customer manifest with exactly one `test` script and
no separate development-dependency section. For that reason, the small set of local verification
tools is pinned alongside runtime packages in `dependencies`; `.tool-versions`, `.node-version`, and
`.nvmrc` pin Node and pnpm without widening the closed manifest.

## Frozen provider-update identity

| Field | Value |
| --- | --- |
| Provider | `stripe` |
| Change | `stripe-node.decimal-string-v21` |
| Capability | `provider.update` |
| Environment | `sandbox` |
| Bundle digest | `sha256/v1$42814155a4a9dc18e2c8cec0f6de941c21de9cc90c88cd73a3c88792c1d2e5c6` |
| Verification profile | `provider-update-alpha-stripe-v1` |
| Verification digest | `sha256/v1$d4d2b8f76d4557e523a95e9196de31c10723c6a9a5d00a0db2077c608ec62f56` |

The seed was designed from Pramaan commit
`5c6f36c6f187f11b4914fba5def66af1abb743a2` and Product Loop commit
`5ba1bc7ad7b24819eddb50160a11c8ca6a73c8e9`. The canonical declaration says Stripe SDK versions
below v21 are affected and identifies `checkout.session.currency_conversion.fx_rate` plus generic
decimal-string request/response fields. The pinned Stripe pack recognizes only the exact typed
response-read pattern used here and intentionally invents no request field, constructor call,
string conversion, codemod, or source patch.

## Expected Stripe migration

The baseline declares `stripe: ^20.3.0` and locks affected `stripe@20.4.1`. Product Loop's validated
automatic candidate is intentionally one manifest edit:

```text
stripe: ^20.3.0  ->  stripe: >=21.0.1 <22.0.0
```

The two affected response reads are:

- `src/billing/checkout-settlement-rate.ts`
- `src/analytics/checkout-conversion-rate.ts`

Both must receive manual response-surface review because `fx_rate` changes from a string to
`Stripe.Decimal`. After the manifest edit, refresh `pnpm-lock.yaml`, update the Stripe test double
to construct the v21 decimal value, and make the two assertions compare its string representation.
Then run `pnpm test`. This is a small dependency/lock/test-fixture migration; the provider pack
does not claim an automatic application-source codemod.

`src/payments/observe-payment-status.ts` is a real but unaffected Stripe type usage and must remain
untouched. The Resend and Better Auth modules are dashboard breadth only and must not be pulled into
the Stripe change. Exact affected, manual-verification, and untouched path sets are frozen in
`seed-manifest.json` and checked as part of `pnpm test`.

## Publication boundary

The local `main` commit and Git tree are resolved only after the self-containing seed is committed:

```sh
git rev-parse refs/heads/main
git rev-parse refs/heads/main^{tree}
```

Suggested protected-main and `product-loop/live-demo-*` branch rules are documented in
`docs/repository-rules.md`. They allow a later authorized Product Loop run to create a new demo
branch without changing `main`. This seed does not push, create a remote branch, open a pull
request, register an App, use a key, call a provider, merge, or deploy.
