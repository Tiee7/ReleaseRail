# Judge demo runbook

This runbook is for a short, reproducible main-track demonstration: EzDSH supplies the live project and ReleaseRail supplies the integration. The separate KeeperHub feature bounty is PR #2525 and is not required for this flow.

## Before recording

1. Use a clean ReleaseRail checkout and run `pnpm install`, `pnpm build`, and `pnpm test`.
2. Create a local policy from the example. Use a small Base Sepolia native amount and an address intentionally allowlisted for `Tiee7`.
3. Confirm the selected EzDSH release URL and contribution commit URL in a browser or the public GitHub API.
4. Confirm the KeeperHub API key and RPC URL are available without displaying their values.
5. Confirm the demo environment points to ReleaseRail, not the EzDSH source directory.

## Recording sequence

1. Start the ReleaseRail MCP server from the clean build.
2. Ask the EzDSH agent to call `release_candidate`.
3. Show the GitHub release, contribution commit, contributor attribution, and evidence hash.
4. Call `prepare_payout` and show the deterministic chain, asset, recipient, amount, reason, and canonical hash.
5. Explicitly approve the exact intent hash.
6. Run simulation and show that no broadcast occurs before it passes.
7. Execute once through KeeperHub, show the execution ID, then show the independently verified Base Sepolia transaction.
8. Call `execute_payout` a second time and show that the original execution identity is reused.
9. Call `get_payout_proof` and show the redacted public evidence bundle.

## Stop conditions

Stop the recording and do not claim success if GitHub evidence is ambiguous, the recipient is not allowlisted, simulation is unknown or failing, KeeperHub returns no execution identity, the receipt is missing, the recipient/value/chain does not match, or the proof contains anything credential-like.

## Submission evidence to retain

- ReleaseRail repository URL and commit SHA.
- EzDSH repository, release, and contribution commit URLs.
- Redacted intent JSON and proof JSON.
- KeeperHub execution ID and confirmed explorer transaction URL.
- Screenshot or recording of the EzDSH MCP tool sequence.
- Test and build output from the same revision used in the demo.
