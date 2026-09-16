# ReleaseRail × EzDSH Design

## Decision

Build ReleaseRail as a new, standalone repository for the KeeperHub Agent Economy Hackathon main track. ReleaseRail is an MCP/CLI integration that runs alongside the existing public EzDSH project; it does not modify the EzDSH repository or its source code.

The separate KeeperHub Feature Bounty submission remains PR #2525. The main-track product and the bounty contribution are submitted as separate BUIDLs.

## Problem

An AI agent can identify that a contribution shipped, but an agent must not invent the payment address, amount, or execution path at the moment money moves. Open-source projects need a small, auditable bridge from a verified release contribution to a deterministic contributor payout.

ReleaseRail turns a natural-language request such as “pay the contributor whose change shipped in the latest EzDSH release” into a reviewable payout intent. GitHub supplies release and contribution evidence. A deterministic policy validates the intent. KeeperHub simulates, executes, polls, and provides the onchain execution record.

## Competition integration

The live project is `Tiee7/EzDSH`, a public AI desktop distribution with an active repository, releases, and an extension surface. ReleaseRail is invoked from the EzDSH agent through MCP. The demo uses a real EzDSH release and contribution evidence, then moves a small testnet amount through KeeperHub to a configured recipient.

The submitted main-track artifact is the ReleaseRail repository, not the EzDSH repository. The submission includes its source, EzDSH MCP setup, a short demo video, and a confirmed KeeperHub transaction link.

## Goals

1. Verify that a named contribution is included in a named GitHub release.
2. Produce a deterministic payout intent with explicit recipient, amount, chain, asset, and policy version.
3. Require human approval of the exact intent before broadcast.
4. Use KeeperHub as the only signing and broadcasting path.
5. Make simulation, execution, polling, receipt verification, and duplicate handling observable.
6. Produce a redacted proof bundle that a judge can inspect without credentials.
7. Be runnable from EzDSH through a documented MCP configuration without changing EzDSH code.

## Non-goals

- No changes to the EzDSH repository.
- No private-key handling, wallet implementation, or local signing.
- No autonomous selection of arbitrary recipients, assets, chains, or amounts.
- No general payroll, treasury, DeFi strategy, or multi-chain expansion in the hackathon slice.
- No web dashboard unless the CLI/MCP path is already complete and the dashboard materially improves the demo.
- No dependency on the KeeperHub PR being merged before the main demo works.

## Primary user flow

1. The user starts ReleaseRail's MCP server and connects it to EzDSH.
2. The EzDSH agent calls `release_candidate` with a repository, release tag, and contribution commit.
3. ReleaseRail fetches public GitHub evidence and checks that the commit is reachable from the release tag and attributed to the expected contributor.
4. The user calls `prepare_payout` with a policy identifier and an explicitly configured recipient address.
5. ReleaseRail validates the chain, asset, amount cap, recipient mapping, contribution evidence, and canonical intent hash.
6. The user reviews the exact intent and calls `approve_payout`.
7. ReleaseRail calls KeeperHub with `simulate: true`. A simulation failure is terminal for that intent and never broadcasts.
8. ReleaseRail executes the same canonical payload with a stable `Idempotency-Key`, then polls the returned execution identity.
9. ReleaseRail independently verifies the transaction receipt and expected recipient/value/asset before marking the intent settled.
10. ReleaseRail writes a proof bundle containing public GitHub URLs, the intent hash, KeeperHub execution ID, transaction hash, explorer URL, and verification outcome. It never writes credentials.

## Product surface

The core is a TypeScript library with a thin CLI and stdio MCP adapter.

### MCP tools

- `release_candidate`
  - Input: `{ repository, tag, contributionCommit, expectedContributor }`
  - Output: verified release/commit evidence, contributor, and a stable evidence hash.
  - Side effect: none.

- `prepare_payout`
  - Input: `{ candidateId, policyId, recipientAddress, amount }`
  - Output: `PayoutIntent` with status `prepared` and a canonical intent hash.
  - Side effect: local redacted intent record only.

- `simulate_payout`
  - Input: `{ intentId }`
  - Output: simulation status, KeeperHub execution identity if supplied, and structured failure reason.
  - Side effect: no onchain broadcast.

- `approve_payout`
  - Input: `{ intentId, expectedIntentHash }`
  - Output: approved intent status.
  - Side effect: local approval record; the hash must match exactly.

- `execute_payout`
  - Input: `{ intentId, expectedIntentHash }`
  - Output: execution ID, status, transaction hash/link when confirmed, and proof path.
  - Side effect: one KeeperHub execution at most for the canonical intent.

- `get_payout_proof`
  - Input: `{ intentId }`
  - Output: redacted proof bundle and verification status.
  - Side effect: none.

The CLI exposes the same flow for deterministic recording and judge reproduction. The MCP adapter must not contain business rules; it delegates to the core library.

## Data contracts

### `ReleaseCandidate`

```ts
type ReleaseCandidate = {
  candidateId: string
  repository: string
  tag: string
  releaseUrl: string
  releaseTargetSha: string
  contributionCommit: string
  commitUrl: string
  expectedContributor: string
  observedContributor: string
  commitInRelease: true
  evidenceHash: string
}
```

### `PayoutIntent`

```ts
type PayoutIntent = {
  intentId: string
  candidateId: string
  evidenceHash: string
  policyId: string
  policyVersion: string
  recipientAddress: `0x${string}`
  chainId: number
  asset: 'native'
  amountBaseUnits: string
  reason: string
  canonicalPayloadHash: string
  status: 'prepared' | 'approved' | 'simulated' | 'executing' | 'settled' | 'blocked'
}
```

Canonical hashing must use sorted object keys, UTF-8 JSON, and no floating-point amounts. The idempotency key is derived from the canonical payload hash and is stable across process restarts.

## Architecture

```text
EzDSH agent
    │ MCP stdio
    ▼
ReleaseRail MCP adapter
    │
    ▼
ReleaseRail core ── GitHub public API ── release/commit evidence
    │
    ├── deterministic policy + intent store
    │
    └── KeeperHub client ── simulate → execute → status
                                      │
                                      ▼
                              testnet receipt verifier
                                      │
                                      ▼
                                proof bundle
```

Responsibilities are isolated:

- `github-evidence`: public GitHub reads and release/contribution verification.
- `policy`: recipient mapping, amount/chain/asset caps, and intent validation.
- `intent-store`: local state transitions and replay protection.
- `keeperhub-client`: HTTP contract, simulation, idempotency, polling, and redacted errors.
- `receipt-verifier`: independent expected-transfer checks against the chain RPC/explorer data.
- `mcp-server` and `cli`: transport adapters only.

## Failure handling

- Missing release, missing commit, tag mismatch, or contributor mismatch → `blocked`, no KeeperHub call.
- Unknown recipient mapping or amount over policy cap → `blocked`, no KeeperHub call.
- Simulation revert or invalid KeeperHub response → `blocked`, no broadcast.
- Timeout after a submitted execution → retain `executionId`, mark `executing`, reconcile by the same idempotency identity; never create a fresh payment.
- Transaction receipt mismatch → `blocked` with the original transaction hash preserved; never claim settled.
- Duplicate `execute_payout` for a settled or executing intent → return the existing execution/proof rather than broadcast again.
- GitHub and KeeperHub credentials are read only from environment variables and are never included in logs, JSON proof, screenshots, commits, or prompts.

## Testing and evidence

Automated tests must cover:

1. Release target resolution and commit ancestry.
2. Contributor attribution mismatch.
3. Canonical hash and stable idempotency key.
4. Recipient, asset, chain, and amount policy gates.
5. Simulation failure with zero broadcast calls.
6. Successful execution and status polling using mocked KeeperHub responses.
7. Repeated execution returning the original execution identity.
8. Timeout/reconciliation without a second transfer.
9. Receipt recipient/value/chain mismatch.
10. MCP tool schemas and CLI-to-core parity.

Live acceptance evidence must include:

- the EzDSH repository and release URL;
- the contribution commit URL;
- a redacted ReleaseRail intent/proof JSON;
- KeeperHub execution ID;
- confirmed testnet transaction URL;
- a second-run/no-duplicate result;
- a short screen recording of the EzDSH MCP flow.

## Scope and sequence

### P0 for the submission

- TypeScript project and tests.
- GitHub release/contribution verifier.
- One native-asset testnet payout path.
- Deterministic policy and intent state machine.
- KeeperHub simulate/execute/status client.
- Receipt verification and proof bundle.
- Stdio MCP server for EzDSH.
- CLI reproduction commands and submission documentation.

### Explicitly deferred

- ERC-20 payouts.
- Multiple recipients and batching.
- Web dashboard.
- Mainnet execution.
- Automatic GitHub webhook hosting.
- Editing or upstreaming any EzDSH source.

## Acceptance criteria

The main-track artifact is ready only when a clean checkout can run the mocked test suite, start the MCP server, reproduce a candidate from public EzDSH release evidence, prepare and approve an intent, and either run the live testnet flow or fail closed with a recorded external prerequisite. The final submission must contain a confirmed KeeperHub transaction link; a mock-only demo is not sufficient.
