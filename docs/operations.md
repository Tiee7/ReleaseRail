# ReleaseRail operations

ReleaseRail is a standalone MCP/CLI integration for the KeeperHub Agent Economy Hackathon. It verifies a contribution in a GitHub release and pays one explicitly configured contributor through KeeperHub on a testnet.

## Setup

```bash
pnpm install
pnpm build
pnpm preflight
cp integrations/ezdsh/payout-policy.example.json integrations/ezdsh/payout-policy.json
```

Edit the copied policy locally. Replace the placeholder recipient with the exact address that is already approved for the contributor. Keep the local policy file out of Git; `.gitignore` excludes `payout-policy.json`.

Set credentials only in the process environment:

```bash
export KEEPERHUB_API_KEY='...'
export RELEASERAIL_RPC_URL='https://sepolia.base.org'
export RELEASERAIL_POLICY_FILE="$PWD/integrations/ezdsh/payout-policy.json"
```

Do not print the environment, put credentials in JSON, or paste them into prompts. `GITHUB_TOKEN` is optional for public reads and is only used to raise GitHub API rate limits.

## CLI flow

```bash
pnpm cli candidate \
  --repository Tiee7/EzDSH \
  --tag v1.8.1559 \
  --contribution-commit <commit-sha> \
  --expected-contributor Tiee7

pnpm cli prepare \
  --candidate-id <candidate-id> \
  --policy-id ezdsh-release-testnet \
  --recipient-address <allowlisted-address> \
  --amount-base-units 1000000 \
  --reason 'Contribution shipped in EzDSH release'

pnpm cli approve --intent-id <intent-id> --expected-intent-hash <hash>
pnpm cli simulate --intent-id <intent-id>
pnpm cli execute --intent-id <intent-id> --expected-intent-hash <hash>
pnpm cli proof --intent-id <intent-id>
```

The intended state sequence is `prepared → approved → simulated → executing → settled`. A simulation or receipt mismatch produces `blocked`. A submitted execution without enough evidence remains `executing` with an `unknown` outcome and must be reconciled by the same execution identity; do not create a new payment.

## MCP flow

Build first, then use `integrations/ezdsh/mcp-config.json` as the template for an EzDSH MCP connection. It starts `node dist/mcp-server.js` from the ReleaseRail checkout and exposes the six tools documented in `integrations/ezdsh/demo-prompt.md`.

## Evidence and recovery

- State is written under `.releaserail/state` with atomic same-directory replacement.
- Public proof bundles are written under `.releaserail/proofs` with fixed fields and mode `0600`.
- The idempotency key is derived from the canonical intent hash. Re-running an executing or settled intent reuses its existing execution identity.
- KeeperHub status is not treated as an onchain settlement. ReleaseRail independently verifies the receipt chain, recipient, native value, and successful receipt.
- If the process stops after a KeeperHub acceptance, inspect the intent state and call `execute` again with the same intent hash. The service polls the stored execution identity instead of broadcasting a second transfer.
