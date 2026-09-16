# Safe publication under Tiee7

ReleaseRail must be published under the Tiee7 GitHub identity. The local `gh` session may belong to a different account; do not use it to create or push the main-track repository.

## Pre-publish checks

```bash
gh auth status
ssh -T git@tiee7
git status --short
```

The SSH check should identify `Tiee7`. The repository must be created as `Tiee7/ReleaseRail` through a Tiee7-authenticated GitHub session before adding a remote. Do not create a repository with another account and transfer it later unless the competition submission identity is explicitly confirmed.

## Push after the correct repository exists

```bash
git remote add origin git@tiee7:Tiee7/ReleaseRail.git
git push -u origin main
```

Verify the remote and the visible commit history in the browser. Keep the working tree clean and do not push `.env`, local policy files, `.releaserail/`, live proof, or recordings containing secrets.

## Submission identity

Use the published `Tiee7/ReleaseRail` URL in `SUBMISSION_MAIN.md`. Keep the separate KeeperHub Feature Bounty PR mapping in `SUBMISSION_BOUNTY.md`; do not merge the two BUIDL identities in a single submission.
