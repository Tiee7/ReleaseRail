# ReleaseRail

<img src="assets/rr-logo.png" alt="ReleaseRail logo" width="96" />

> **Projects can announce rewards. ReleaseRail helps them prove they paid.**

ReleaseRail is a public settlement layer for digital contribution. It connects verified GitHub work, deterministic reward policy, human approval, controlled KeeperHub execution, and independently verifiable onchain payment evidence.

We use the live [Tiee7/EzDSH](https://github.com/Tiee7/EzDSH) project to demonstrate the ReleaseRail workflow through MCP. ReleaseRail does not modify the EzDSH source repository or the HackthonSniper research repository.

The main-track artifact is this standalone ReleaseRail repository. The separate KeeperHub Feature Bounty is [PR #2525](https://github.com/KeeperHub/keeperhub/pull/2525); it is an independent KeeperHub repository change and is not required for the main-track integration to run.

## Why this matters

### Reward announcements are easy. Payment proof is rare.

Open-source and AI collaboration create real digital labor every day. A contribution may be recorded in GitHub, a reward policy may live in a document, and the final payment may happen through a private transfer or a screenshot.

That makes it difficult for outsiders to distinguish projects that genuinely compensate contributors from projects that only advertise rewards. It also gives honest projects no durable, public way to build payment credibility.

ReleaseRail is built around a simple principle:

> **A project should be able to prove that a real contribution led to a real, rule-bound, verifiable payment.**

This is not a promise of future rewards. It is public evidence of what a project has actually paid.

## The product

ReleaseRail is an **evidence-to-settlement rail** for open collaboration:

```text
Verified contribution
        ↓
Deterministic reward policy
        ↓
Human-approved payout intent
        ↓
KeeperHub simulation and execution
        ↓
Independent receipt verification
        ↓
Public payment proof
```

ReleaseRail is not a wallet, a generic payroll system, or an autonomous agent that invents payment decisions. It is the deterministic boundary between an agent's discovery and an irreversible financial action.

## What it proves

| Layer | Guarantee |
| --- | --- |
| Contribution | The commit is attributed to the expected contributor and is reachable from the named release. |
| Policy | Recipient, amount, chain, asset, and policy version are explicit and allowlisted. |
| Approval | A human approves the exact canonical payload hash before broadcast. |
| Execution | KeeperHub is the only signing and broadcasting path; simulation happens first. |
| Settlement | The receipt is checked independently against the expected chain, recipient, value, and status. |
| Public proof | A redacted proof connects contribution evidence, policy, execution identity, and transaction. |

## Public payment credibility

Every settled payout can produce a redacted public record containing:

- project, release, and contribution commit;
- contributor attribution;
- policy ID and policy version;
- chain, asset, and amount;
- KeeperHub execution ID;
- transaction hash and explorer URL;
- independent receipt-verification result.

The current repository demonstrates this public-proof path with a tracked redacted candidate record and a confirmed Base Sepolia transaction. The local web console is an operator and judge audit surface bound to `127.0.0.1`; it is not presented as a hosted public ledger by itself. A hosted public ledger or static index can be added as a deployment layer without changing the settlement core.

## Verified demo evidence

- Live project: [Tiee7/EzDSH](https://github.com/Tiee7/EzDSH)
- Release: [v1.8.1559](https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559)
- Contribution: [83d0e7a9e99cbb1ff0192502a7890d291c5b89e0](https://github.com/Tiee7/EzDSH/commit/83d0e7a9e99cbb1ff0192502a7890d291c5b89e0)
- Contributor: `Tiee7`
- Public candidate record: [evidence/public-candidate.json](evidence/public-candidate.json)
- KeeperHub execution: `oecytu85by4mzs145bcn5`
- Verified transaction: [Base Sepolia transaction](https://sepolia.basescan.org/tx/0x8009dd6aefd6725418fec94e021c77c9570d58dd3f4c34e02cdcf7bea74f3c82)
- Replay result: the same settled intent reused the original execution identity; no second transfer was broadcast.

## Quick start

### Requirements

- Node.js 24 or newer;
- pnpm;
- a KeeperHub API key with access to the target organization;
- a supported testnet RPC, such as Base Sepolia;
- a local policy with an exact allowlisted recipient.

Install and validate the repository:

```bash
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
pnpm build
pnpm preflight
```

`preflight` checks readiness without printing credential values. It does not prove that an API key is valid, that the KeeperHub organization has permission, or that the spending account has enough testnet funds.

### Configure a local payout policy

Create the local policy from the credential-free example:

```bash
cp integrations/ezdsh/payout-policy.example.json integrations/ezdsh/payout-policy.json
```

Example:

```json
{
  "policyId": "ezdsh-release-testnet",
  "policyVersion": "2026-09-16.1",
  "repository": "Tiee7/EzDSH",
  "chainId": 84532,
  "asset": "native",
  "maxAmountBaseUnits": "1000000000000000",
  "recipients": {
    "Tiee7": [
      "0x<allowlisted-address>"
    ]
  }
}
```

The contributor key comes from the GitHub evidence. The value is one or more exact EVM addresses allowed for that contributor. The real `payout-policy.json` is ignored by Git and must never contain private keys or API keys.

### Load credentials from the environment

```bash
export KEEPERHUB_API_KEY='<secret-value>'
export KEEPERHUB_BASE_URL='https://app.keeperhub.com/api'
export RELEASERAIL_RPC_URL='https://sepolia.base.org'
export RELEASERAIL_POLICY_FILE="$PWD/integrations/ezdsh/payout-policy.json"
```

Do not run `printenv`, commit environment files, paste secrets into prompts, or include them in screenshots, videos, JSON proof, or browser fields. `GITHUB_TOKEN` is optional for public GitHub reads and only changes API rate-limit capacity.

## End-to-end CLI flow

The core state machine is:

```text
prepared → approved → simulated → executing → settled
                                      └──────→ blocked
```

### 1. Verify a contribution

```bash
pnpm cli candidate \
  --repository Tiee7/EzDSH \
  --tag v1.8.1559 \
  --contribution-commit <commit-sha> \
  --expected-contributor Tiee7
```

Inspect the release URL, commit URL, observed contributor, and `evidenceHash`. If the ancestry or attribution is ambiguous, stop before creating a payment intent.

### 2. Prepare a deterministic intent

```bash
pnpm cli prepare \
  --candidate-id <candidate-id> \
  --policy-id ezdsh-release-testnet \
  --recipient-address <allowlisted-address> \
  --amount-base-units 1000000 \
  --reason 'Contribution shipped in EzDSH release'
```

This creates a local intent containing the contribution evidence, policy version, recipient, chain, asset, amount, reason, and `canonicalPayloadHash`. Preparation has no onchain side effect.

### 3. Approve the exact hash and simulate

```bash
pnpm cli approve \
  --intent-id <intent-id> \
  --expected-intent-hash <canonical-payload-hash>

pnpm cli simulate --intent-id <intent-id>
```

Approval must match the complete canonical hash. Simulation must pass before execution. A simulation failure or unknown outcome is a stop condition and must not be followed by `execute`.

### 4. Execute once through KeeperHub

```bash
pnpm cli execute \
  --intent-id <intent-id> \
  --expected-intent-hash <canonical-payload-hash>
```

KeeperHub is the only signing and broadcasting path. ReleaseRail does not import, store, or select a private key.

If a request is accepted but confirmation is delayed, reuse the same intent ID and exact hash for reconciliation. Do not prepare a new payout and do not create a new idempotency identity.

### 5. Inspect the public proof

```bash
pnpm cli proof --intent-id <intent-id>
```

The proof contains only an allowlisted public record: GitHub evidence, policy identity, canonical hash, KeeperHub execution identity, transaction information, and receipt verification. Treat `settled` plus `receiptVerified: true` as the completion condition. `executing` or `unknown` means reconcile later, not broadcast again.

## EzDSH MCP integration

Build the MCP server:

```bash
pnpm build
```

Use [integrations/ezdsh/mcp-config.json](integrations/ezdsh/mcp-config.json) as the MCP configuration template. Set `RELEASERAIL_ROOT` to this checkout and provide credentials through the process environment. The configuration starts `node dist/mcp-server.js` over stdio.

The six exposed MCP tools are:

| Tool | Purpose |
| --- | --- |
| `release_candidate` | Verify a contribution is included in a named release. |
| `prepare_payout` | Create a deterministic local intent. |
| `approve_payout` | Approve the exact canonical hash. |
| `simulate_payout` | Run KeeperHub simulation without broadcast. |
| `execute_payout` | Execute idempotently and verify the receipt. |
| `get_payout_proof` | Load the redacted public proof. |

See the [EzDSH demo prompt](integrations/ezdsh/demo-prompt.md) for the intended Agent sequence. The MCP adapter is intentionally thin; business rules remain in the shared ReleaseRail service used by both MCP and CLI.

## Local audit console

After `pnpm build`, start the local console:

```bash
pnpm web
```

Open [http://127.0.0.1:4782](http://127.0.0.1:4782). It reads the same state and proof stores as the CLI/MCP service and shows release evidence, canonical hash, recipient, amount, KeeperHub execution identity, BaseScan link, and independent receipt verification.

The console is a local operator and judge surface. It binds to `127.0.0.1` by default, does not expose credentials to the browser, and gates state changes behind explicit confirmation. It is not a replacement for a future hosted public reward ledger.

## Technical design

```text
EzDSH Agent / MCP client
          │
          ▼
Thin MCP and CLI adapters
          │
          ▼
ReleaseRail service and state machine
   ┌──────┼────────┬───────────────┐
   ▼      ▼        ▼               ▼
GitHub  Policy   Intent store   KeeperHub client
evidence gates   + canonical    simulate / execute
                 hash + replay  / poll
          │
          ▼
Independent Base Sepolia receipt verifier
          │
          ▼
Redacted proof store and public transaction evidence
```

Core responsibilities:

- `src/github`: public GitHub release and commit evidence;
- `src/policy`: repository, recipient, chain, asset, and amount gates;
- `src/domain`: typed contracts, canonical JSON, and stable IDs;
- `src/intents`: atomic local state transitions and replay protection;
- `src/keeperhub`: simulation, idempotent execution, polling, and redacted errors;
- `src/chain`: independent receipt verification against the configured RPC;
- `src/proof`: fixed public-field proof bundles;
- `src/mcp-server.ts` and `src/cli.ts`: transport adapters over the shared service;
- `src/web-server.ts` and `src/web`: local audit surface and state-gated controls.

### Canonical intent and idempotency

The payout payload uses sorted-key canonical JSON, UTF-8 hashing, and integer base units. Its hash is the approval boundary and the source of the idempotency identity. Changing the recipient, amount, reason, policy version, chain, or asset creates a different intent that requires a new review.

### Fail-closed behavior

ReleaseRail blocks instead of claiming success when:

- release, commit, ancestry, or contributor attribution is invalid;
- the recipient is not allowlisted or the amount exceeds the policy cap;
- KeeperHub simulation fails or returns an unknown result;
- the transaction receipt is missing, failed, on the wrong chain, or has the wrong recipient/value;
- a retry would create a new execution identity.

## Safety boundary

The current hackathon slice deliberately stays narrow:

- one native-asset payout on Base Sepolia or Ethereum Sepolia;
- one explicitly configured recipient per intent;
- KeeperHub is the only signing and broadcasting path;
- no private-key handling in ReleaseRail;
- no autonomous selection of arbitrary recipient, asset, chain, or amount;
- no claim of mainnet, payroll, ERC-20, batching, or multi-chain support.

## Verification

Run the repository checks from the same revision used for a demo:

```bash
pnpm test
pnpm typecheck
pnpm build
pnpm preflight
```

For a reproducible live demonstration, follow [docs/demo-runbook.md](docs/demo-runbook.md). For operational setup and recovery, see [docs/operations.md](docs/operations.md). For the local console, see [docs/web-console.md](docs/web-console.md).

## Competition submissions

The main-track BUIDL is ReleaseRail × EzDSH. The separate Feature Bounty submission is KeeperHub [PR #2525](https://github.com/KeeperHub/keeperhub/pull/2525); it is an independent KeeperHub repository change and is not required for the main-track integration to run.

See [SUBMISSION_MAIN.md](SUBMISSION_MAIN.md) and [SUBMISSION_BOUNTY.md](SUBMISSION_BOUNTY.md) for the two separate submission records.

## Project status

This repository is the hackathon integration and demonstration artifact. It is intentionally not a general payroll, treasury, or autonomous financial system. Public payment evidence should remain redacted to the fixed allowlist; credentials, private keys, local policies, and unredacted runtime state must stay outside source control.
