# Main track submission: ReleaseRail × EzDSH

Status: source and public release evidence are ready at the current local main revision; live KeeperHub testnet proof and demo URL remain to be filled after the API key/RPC and Tiee7 publishing session are available.

## BUIDL

- Name: ReleaseRail
- Track: Best Integration into a Live Project
- Live project: [Tiee7/EzDSH](https://github.com/Tiee7/EzDSH)
- Source repository: `TODO: publish this standalone repository under Tiee7`
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

- KeeperHub execution ID: `TODO`
- Base Sepolia transaction URL: `TODO`
- Redacted intent/proof JSON: `evidence/live-proof.json`
- Second-run result: `TODO: same execution identity, no second transfer`

## Why this is a real integration

The user-facing flow is invoked from EzDSH's agent through six MCP tools. The integration is useful beyond the demo because release evidence, recipient policy, approval, idempotency, and receipt verification are durable boundaries rather than prompt instructions. A judge can run the mocked suite locally and inspect the same state machine used by the live path.

## Verification

```bash
pnpm test
pnpm typecheck
pnpm build
```
