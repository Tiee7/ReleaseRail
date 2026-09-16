# ReleaseRail

ReleaseRail is a standalone MCP/CLI integration for the KeeperHub Agent Economy Hackathon. It connects a live open-source project to a deterministic, reviewable testnet payout:

```text
EzDSH agent → ReleaseRail MCP → GitHub release evidence
                              → policy-bound payout intent
                              → KeeperHub simulate/execute/status
                              → independent receipt verification
                              → redacted proof bundle
```

The integration target is the public [Tiee7/EzDSH](https://github.com/Tiee7/EzDSH) project. ReleaseRail does not modify EzDSH or the HackthonSniper research repository. KeeperHub is the only signing and broadcasting path; ReleaseRail never handles private keys.

## Why it matters

An agent can find a contribution, but it should not invent where money goes or silently move money. ReleaseRail binds public GitHub evidence, a versioned recipient policy, native testnet amount, chain, and human approval into one canonical intent. Simulation happens before broadcast. A successful KeeperHub status is not enough: the transaction receipt must independently match the expected chain, recipient, and value.

## Quick start

```bash
pnpm install
pnpm test
pnpm build
pnpm cli help
```

Copy and edit the policy example locally, then follow [operations.md](docs/operations.md) or the [judge demo runbook](docs/demo-runbook.md). The EzDSH MCP template and prompt are under [integrations/ezdsh](integrations/ezdsh/).

## Safety boundary

- P0 is one native-asset testnet payout on Base Sepolia or Ethereum Sepolia.
- Recipient, chain, asset, amount cap, and policy version are deterministic and reviewable.
- `approve_payout` requires the exact canonical intent hash.
- Every broadcast uses an idempotency key derived from that hash.
- Simulation failure, receipt mismatch, missing receipt, and unknown outcomes fail closed.
- Proof JSON contains a fixed public-field allowlist and rejects credential-like values.

## Repository layout

- `src/domain`: typed contracts, canonical hashing, and stable IDs.
- `src/github`: release/commit evidence checks.
- `src/policy` and `src/intents`: deterministic policy gates and atomic state.
- `src/keeperhub`: simulation, idempotent execution, polling, and redacted errors.
- `src/chain` and `src/proof`: receipt verification and public proof bundles.
- `src/releaserail-service.ts`: stateful orchestration shared by CLI and MCP.
- `integrations/ezdsh`: clean-checkout MCP configuration and judge prompt.

The separate Feature Bounty work is submitted to KeeperHub as PR #2525; it is not a dependency of this main-track repository.
