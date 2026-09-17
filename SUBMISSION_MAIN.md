# Main track submission: ReleaseRail × EzDSH

Status: the live KeeperHub testnet proof is confirmed; the remaining submission steps are publishing this repository under Tiee7 and recording the short demo video.

## BUIDL

- Name: ReleaseRail
- Track: Best Integration into a Live Project
- Live project: [Tiee7/EzDSH](https://github.com/Tiee7/EzDSH)
- Source repository: [Tiee7/ReleaseRail](https://github.com/Tiee7/ReleaseRail)
- Demo URL: `TODO: record the EzDSH MCP flow`

## What ships

ReleaseRail is a standalone TypeScript MCP/CLI integration. It verifies that a named contribution is included in a named EzDSH release, binds the evidence to a versioned allowlist policy, requires explicit approval of a canonical payout hash, calls KeeperHub for simulation and idempotent execution, independently verifies the testnet receipt, and writes a redacted proof bundle.

EzDSH is the live integration target; its source is not modified. ReleaseRail runs beside it through the MCP configuration in `integrations/ezdsh/mcp-config.json`.

## Public evidence already verified

- Release: [v1.8.1559](https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559)
- Contribution: [83d0e7a9e99cbb1ff0192502a7890d291c5b89e0](https://github.com/Tiee7/EzDSH/commit/83d0e7a9e99cbb1ff0192502a7890d291c5b89e0)
- Observed contributor: `Tiee7`
- Candidate ID: `candidate-268dc9f5e3e32d28b6e0972e`
- Evidence hash: `268dc9f5e3e32d28b6e0972e721fd73e784f73f07c3a805881d67eb7a047e604`
- Redacted public record: [evidence/public-candidate.json](evidence/public-candidate.json)

## KeeperHub proof to attach

- KeeperHub execution ID: `oecytu85by4mzs145bcn5`
- Base Sepolia transaction URL: [verified transaction](https://sepolia.basescan.org/tx/0x8009dd6aefd6725418fec94e021c77c9570d58dd3f4c34e02cdcf7bea74f3c82)
- Redacted intent/proof JSON: attach the local `evidence/live-proof.json` to the BUIDL submission; it remains gitignored intentionally
- Receipt verification: `verified: true`, Base Sepolia block `46928205`
- Second-run result: the same settled intent returned the original execution identity and transaction link; no second transfer was sent

## Why this is a real integration

The user-facing flow is invoked from EzDSH's agent through six MCP tools. The integration is useful beyond the demo because release evidence, recipient policy, approval, idempotency, and receipt verification are durable boundaries rather than prompt instructions. A judge can run the mocked suite locally and inspect the same state machine used by the live path.

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
```
