# ReleaseRail web console

The web console is a local, read-only audit surface for operators and judges. It reads the same intent and proof stores as the CLI/MCP service; it does not create intents, approve payouts, simulate, or broadcast transactions.

## Start it

From the ReleaseRail repository root, after the normal environment has been loaded:

```bash
pnpm build
pnpm web
```

Open [http://127.0.0.1:4782](http://127.0.0.1:4782). The port can be changed without changing the source:

```bash
RELEASERAIL_WEB_PORT=4783 pnpm web
```

The default bind address is `127.0.0.1`. Set `RELEASERAIL_WEB_HOST` only when a deliberate non-local bind is required.

## What it shows

- intent summary: total, settled, verified, pending, and blocked;
- GitHub release and contribution links;
- canonical payload hash;
- chain, amount, and recipient-linked payout evidence;
- KeeperHub execution identity and transaction hash;
- BaseScan transaction link when available;
- independent receipt verification and duplicate-replay note.

The page refreshes every ten seconds and can also be refreshed manually. The server returns only the dashboard snapshot and fixed static assets; it does not return environment variables, API keys, or private keys.

## Recording the demo

Use the console after `get_payout_proof` has completed. Select the settled intent, open the GitHub release, contribution commit, and BaseScan links, then show the canonical hash, KeeperHub execution ID, `VERIFIED` receipt state, and the idempotent replay note. Keep the terminal with `.env` or `codex-live.env` out of the recording.
