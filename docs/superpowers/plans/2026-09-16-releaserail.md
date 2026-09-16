# ReleaseRail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone ReleaseRail MCP/CLI integration that verifies a contribution shipped in an EzDSH release and executes one reviewed, idempotent testnet payout through KeeperHub.

**Architecture:** A TypeScript core owns GitHub evidence, policy gates, canonical payout intents, local state, KeeperHub calls, receipt verification, and proof bundles. A thin stdio MCP adapter and CLI expose the same core operations. EzDSH is only the live integration target; its repository is not modified.

**Tech Stack:** Node.js 24, TypeScript, pnpm, Vitest, native `fetch`, `@modelcontextprotocol/sdk`, and `viem` for EVM receipt verification.

## Global Constraints

- The EzDSH repository and HackthonSniper repository must not be modified.
- KeeperHub is the only signing/broadcasting path; ReleaseRail never handles private keys.
- The agent may propose evidence, but recipient, chain, asset, amount, and policy are deterministic and explicitly reviewable.
- Native-asset testnet payout is the only live P0 path; ERC-20, batching, web UI, webhooks, and mainnet are deferred.
- Credentials are environment-only and must never enter logs, proof JSON, screenshots, commits, or test fixtures.
- Every broadcast uses a stable idempotency key derived from a canonical intent hash.
- A failed or mismatched verification must fail closed and preserve the original evidence.

---

### Task 1: Project scaffold and test harness

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `.env.example`
- Create: `src/index.ts`
- Create: `test/smoke.test.ts`

**Interfaces:**
- Produces scripts `test`, `typecheck`, `dev`, `cli`, and `mcp`.
- Produces an importable `src/index.ts` without performing network calls at import time.

- [x] **Step 1: Write the failing smoke test**

```ts
import { describe, expect, it } from 'vitest'
import { productName } from '../src/index.js'

describe('project scaffold', () => {
  it('identifies the product', () => expect(productName).toBe('ReleaseRail'))
})
```

- [x] **Step 2: Run `pnpm test --run test/smoke.test.ts` and confirm the missing-module failure.**

- [x] **Step 3: Add the package/tooling files and `productName` export.** Pin Node to `>=24`, use ESM, and configure Vitest to load TypeScript from `src`.

- [x] **Step 4: Run `pnpm test --run test/smoke.test.ts` and `pnpm typecheck`; both must pass.**

- [x] **Step 5: Commit**

```bash
git add package.json tsconfig.json vitest.config.ts .gitignore .env.example src/index.ts test/smoke.test.ts
git commit -m "chore: scaffold ReleaseRail"
```

### Task 2: Canonical values, contracts, and hashing

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/canonical-json.ts`
- Create: `src/domain/ids.ts`
- Create: `test/domain/canonical-json.test.ts`
- Create: `test/domain/ids.test.ts`

**Interfaces:**
- `canonicalJson(value: unknown): string`
- `sha256Hex(value: string): string`
- `intentId(candidateId: string, policyId: string, payloadHash: string): string`
- `idempotencyKey(payloadHash: string): string`
- `ReleaseCandidate`, `PayoutIntent`, `PayoutPolicy`, `PayoutProof`, and `IntentStatus` types.

- [x] **Step 1: Write tests proving sorted keys, nested sorting, no floating-point amounts, and stable IDs.**

```ts
expect(canonicalJson({ b: 2, a: 1 })).toBe('{"a":1,"b":2}')
expect(canonicalJson({ amountBaseUnits: '1000' })).toBe('{"amountBaseUnits":"1000"}')
expect(idempotencyKey('abc')).toMatch(/^releaserail-[0-9a-f]{64}$/)
```

- [x] **Step 2: Run the focused tests and confirm they fail before implementation.**

- [x] **Step 3: Implement recursive object-key sorting, UTF-8 SHA-256 hashing, and the typed contracts.** Reject non-finite numbers and undefined object fields.

- [x] **Step 4: Run `pnpm test --run test/domain/canonical-json.test.ts test/domain/ids.test.ts` and `pnpm typecheck`.**

- [x] **Step 5: Commit**

```bash
git add src/domain test/domain
git commit -m "feat: add canonical ReleaseRail intent contracts"
```

### Task 3: GitHub release evidence

**Files:**
- Create: `src/github/github-client.ts`
- Create: `src/github/release-evidence.ts`
- Create: `test/github/release-evidence.test.ts`

**Interfaces:**
- `GitHubClient.getRelease(owner: string, repo: string, tag: string): Promise<GitHubRelease>`
- `GitHubClient.getCommit(owner: string, repo: string, sha: string): Promise<GitHubCommit>`
- `buildReleaseCandidate(input, client): Promise<ReleaseCandidate>`
- Public reads use native `fetch`; `GITHUB_TOKEN` is optional and read only from the environment.

- [x] **Step 1: Write fixture-backed tests for a valid release/commit, wrong tag ancestry, and contributor mismatch.** The invalid cases must make zero KeeperHub calls because this layer has no KeeperHub dependency.

- [x] **Step 2: Run `pnpm test --run test/github/release-evidence.test.ts` and confirm failure.**

- [x] **Step 3: Implement GitHub response parsing and checks.** Require the release tag's target SHA to be an ancestor of the contribution commit or equal to it, require the expected contributor login to match the commit author/committer evidence, and include public URLs in the candidate.

- [x] **Step 4: Run focused tests and `pnpm typecheck`.**

- [x] **Step 5: Commit**

```bash
git add src/github test/github
git commit -m "feat: verify shipped GitHub contributions"
```

### Task 4: Policy gates and durable intent store

**Files:**
- Create: `src/policy/policy.ts`
- Create: `src/intents/intent-store.ts`
- Create: `test/policy/policy.test.ts`
- Create: `test/intents/intent-store.test.ts`

**Interfaces:**
- `validatePayout(policy: PayoutPolicy, candidate: ReleaseCandidate, input): PayoutIntent`
- `IntentStore.create(intent): Promise<PayoutIntent>`
- `IntentStore.transition(intentId, expectedStatus, next): Promise<PayoutIntent>`
- `IntentStore.get(intentId): Promise<PayoutIntent | undefined>`
- State is stored under a caller-supplied directory; test and demo state never lives in source control.

- [x] **Step 1: Write tests for recipient allowlisting, chain/asset restrictions, amount cap, candidate hash binding, stale transition rejection, and duplicate reads.**

- [x] **Step 2: Run focused tests and confirm failure.**

- [x] **Step 3: Implement policy validation using string base units only.** The policy must bind `candidateId`, `evidenceHash`, recipient address, chain ID, asset, amount, and policy version into the canonical payload hash.

- [x] **Step 4: Implement atomic JSON state replacement using a temporary file in the same directory and `rename`; preserve an `executionId` once observed.**

- [x] **Step 5: Run focused tests, then commit.**

```bash
git add src/policy src/intents test/policy test/intents
git commit -m "feat: gate and persist payout intents"
```

### Task 5: KeeperHub execution client

**Files:**
- Create: `src/keeperhub/client.ts`
- Create: `src/keeperhub/errors.ts`
- Create: `test/keeperhub/client.test.ts`

**Interfaces:**
- `KeeperHubClient.simulateTransfer(request): Promise<SimulationResult>`
- `KeeperHubClient.executeTransfer(request, idempotencyKey): Promise<ExecutionAccepted>`
- `KeeperHubClient.getExecutionStatus(executionId): Promise<ExecutionStatus>`
- All requests use `KEEPERHUB_API_KEY` and `KEEPERHUB_BASE_URL` from the environment without exposing the key in errors.

- [x] **Step 1: Write HTTP-mocked tests for simulate success, simulate failure, execute acceptance, status polling, redacted HTTP errors, and a second execute with the same idempotency key.**

- [x] **Step 2: Run focused tests and confirm failure.**

- [x] **Step 3: Implement the REST client.** Send `simulate: true` for preflight, send the exact canonical transaction payload for broadcast, include `Idempotency-Key`, retain `executionId`, and parse `transactionHash`/`transactionLink` without assuming success from HTTP 2xx alone.

- [x] **Step 4: Add bounded polling with the server's interval hint when present and an explicit `unknown` outcome when the deadline expires.**

- [x] **Step 5: Run focused tests and commit.**

```bash
git add src/keeperhub test/keeperhub
git commit -m "feat: add safe KeeperHub execution client"
```

### Task 6: Receipt verification and proof bundles

**Files:**
- Create: `src/chain/receipt-verifier.ts`
- Create: `src/proof/proof-store.ts`
- Create: `test/chain/receipt-verifier.test.ts`
- Create: `test/proof/proof-store.test.ts`

**Interfaces:**
- `verifyNativeTransfer(receiptSource, expected): Promise<ReceiptVerification>`
- `writeProof(proofDirectory, proof): Promise<string>`
- `readProof(proofDirectory, intentId): Promise<PayoutProof | undefined>`

- [x] **Step 1: Write tests for matching chain/recipient/value, receipt failure, wrong recipient, wrong value, and proof redaction.**

- [x] **Step 2: Run focused tests and confirm failure.**

- [x] **Step 3: Implement native transfer verification with `viem` public clients and a chain allowlist.** Require a successful receipt and exact recipient/value match; do not mark an intent settled from KeeperHub status alone.

- [x] **Step 4: Implement proof writing with a fixed allowlist of public fields and atomic JSON replacement.** Reject strings that look like bearer tokens, `kh_` keys, or private keys.

- [x] **Step 5: Run focused tests and commit.**

```bash
git add src/chain src/proof test/chain test/proof
git commit -m "feat: verify receipts and write redacted proofs"
```

### Task 7: Orchestration, CLI, and MCP adapter

**Files:**
- Create: `src/releaserail-service.ts`
- Create: `src/cli.ts`
- Create: `src/mcp-server.ts`
- Create: `test/releaserail-service.test.ts`
- Create: `test/mcp-server.test.ts`

**Interfaces:**
- `ReleaseRailService.releaseCandidate(input)`
- `ReleaseRailService.preparePayout(input)`
- `ReleaseRailService.simulatePayout(intentId)`
- `ReleaseRailService.approvePayout(intentId, expectedHash)`
- `ReleaseRailService.executePayout(intentId, expectedHash)`
- `ReleaseRailService.getPayoutProof(intentId)`

- [x] **Step 1: Write service tests for the complete mocked happy path and every fail-closed branch.** Assert that `executePayout` rejects unapproved or hash-mismatched intents and that repeated calls return one execution identity.

- [x] **Step 2: Implement orchestration as explicit state transitions: `prepared → approved → simulated → executing → settled`, with `blocked` and `unknown` outcomes preserved.**

- [x] **Step 3: Implement CLI subcommands `candidate`, `prepare`, `simulate`, `approve`, `execute`, and `proof`.** Each command prints structured JSON and a human-readable summary without secrets.

- [x] **Step 4: Implement stdio MCP tools with schemas matching the design.** The adapter delegates to the service and never chooses an address, amount, or chain.

- [x] **Step 5: Run `pnpm test`, `pnpm typecheck`, and CLI help; commit.**

```bash
git add src/cli.ts src/mcp-server.ts src/releaserail-service.ts test/releaserail-service.test.ts test/mcp-server.test.ts package.json
git commit -m "feat: expose ReleaseRail through CLI and MCP"
```

### Task 8: EzDSH integration package and competition evidence

**Files:**
- Create: `integrations/ezdsh/mcp-config.json`
- Create: `integrations/ezdsh/demo-prompt.md`
- Create: `integrations/ezdsh/payout-policy.example.json`
- Create: `docs/operations.md`
- Create: `docs/demo-runbook.md`
- Create: `README.md`
- Create: `evidence/.gitkeep`

**Interfaces:**
- The config starts `node dist/mcp-server.js` from a clean checkout.
- The demo prompt invokes the six MCP tools in order and requires explicit approval before `execute_payout`.
- Example policy contains no real credentials or private keys.

- [x] **Step 1: Write a documentation test that parses the example MCP config and policy and rejects secret-like values.**

- [x] **Step 2: Add the EzDSH MCP setup and a three-minute demo script showing evidence, policy, simulation, execution, receipt, and duplicate replay.**

- [x] **Step 3: Add README sections for the live project, architecture, security boundary, local mocked demo, live prerequisites, and two-track submission mapping.**

- [x] **Step 4: Run the full test suite, typecheck, and a clean build.**

- [x] **Step 5: Commit.**

```bash
git add integrations docs README.md evidence/.gitkeep test
git commit -m "docs: package EzDSH integration and hackathon evidence"
```

### Task 9: Live acceptance and submission package

**Files:**
- Create only after live execution: `evidence/live-proof.json`
- Create only after recording: `evidence/demo.mp4` or a documented external demo URL
- Create: `SUBMISSION_MAIN.md`
- Create: `SUBMISSION_BOUNTY.md`

- [ ] **Step 1: Run the public EzDSH release/contribution candidate check without credentials.** Record the exact release URL, contribution commit URL, observed contributor, and evidence hash.

- [ ] **Step 2: Configure KeeperHub credentials only in the process environment and run a small testnet simulation.** Save no credential material.

- [ ] **Step 3: Approve and execute once, poll until confirmed, verify the chain receipt, and record the transaction URL.**

- [ ] **Step 4: Re-run the same execution and verify that no second transfer is produced.**

- [ ] **Step 5: Run the final gates:**

```bash
pnpm test
pnpm typecheck
pnpm build
git status --short
```

- [ ] **Step 6: Write the two submission documents with separate BUIDL mapping, then commit the redacted evidence.**

## Self-review checklist

- Every design goal maps to Tasks 2–9.
- No task modifies EzDSH or HackthonSniper.
- No live secret is written to the repository.
- The main BUIDL and Feature Bounty BUIDL remain separate.
- A mock-only run cannot be called complete because Task 9 requires a confirmed KeeperHub transaction.
- Unknown post-submit outcomes remain reconcilable and are never retried with a new identity.
