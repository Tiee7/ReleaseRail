# EzDSH demo prompt

Use the ReleaseRail MCP tools to verify one contribution shipped in the named EzDSH release and prepare a testnet payout.

1. Call `release_candidate` with the repository `Tiee7/EzDSH`, a real release tag, the contribution commit SHA, and the expected GitHub contributor login. Show the returned release URL, commit URL, contributor, and `evidenceHash`.
2. Call `prepare_payout` with the returned `candidateId`, the configured policy ID, the exact allowlisted recipient address, an integer `amountBaseUnits`, and a reason. Show the full canonical payload hash.
3. Ask the user to review the recipient, chain ID, native asset, amount, reason, candidate evidence, and canonical hash. Do not continue without explicit approval.
4. After approval, call `approve_payout` with the exact `intentId` and canonical hash.
5. Call `simulate_payout`. If it is blocked or reports an unknown result, stop and do not call `execute_payout`.
6. Only after the simulation is safe, call `execute_payout` with the same exact hash. Explain that KeeperHub is the only signing/broadcasting path.
7. Call `get_payout_proof` and show the redacted proof, receipt verification, KeeperHub execution ID, and explorer transaction link.

Never invent an address, amount, policy, chain, transaction hash, or proof. Never ask ReleaseRail to handle a private key. A missing receipt or mismatched receipt is not a successful payout.
