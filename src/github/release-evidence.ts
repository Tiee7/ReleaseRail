import { canonicalJson, sha256Hex } from '../domain/canonical-json.js'
import type { ReleaseCandidate } from '../domain/types.js'
import { GitHubClient } from './github-client.js'

export type ReleaseCandidateInput = {
  repository: string
  tag: string
  contributionCommit: string
  expectedContributor: string
}

function splitRepository(repository: string): { owner: string; repo: string } {
  const match = /^([^/]+)\/([^/]+)$/.exec(repository)
  if (match === null) throw new Error(`repository must be owner/name: ${repository}`)
  return { owner: match[1]!, repo: match[2]! }
}

export async function buildReleaseCandidate(input: ReleaseCandidateInput, client: GitHubClient): Promise<ReleaseCandidate> {
  const { owner, repo } = splitRepository(input.repository)
  const release = await client.getRelease(owner, repo, input.tag)
  const tag = await client.getTagRef(owner, repo, input.tag)
  const releaseSha = tag.object.sha
  const commit = await client.getCommit(owner, repo, input.contributionCommit)
  const contributor = commit.author?.login ?? commit.committer?.login
  if (contributor !== input.expectedContributor) {
    throw new Error(`contributor mismatch: expected ${input.expectedContributor}, observed ${contributor ?? 'unknown'}`)
  }
  const comparison = await client.compare(owner, repo, commit.sha, releaseSha)
  if (comparison.status !== 'ahead' && comparison.status !== 'identical') {
    throw new Error(`contribution ${commit.sha} is not reachable from release ${input.tag}: ${comparison.status}`)
  }
  const evidence = {
    commit: commit.sha,
    contributor,
    releaseSha,
    repository: input.repository,
    tag: release.tag_name
  }
  return {
    candidateId: `candidate-${sha256Hex(canonicalJson(evidence)).slice(0, 24)}`,
    repository: input.repository,
    tag: release.tag_name,
    releaseUrl: release.html_url,
    releaseTargetSha: releaseSha,
    contributionCommit: commit.sha,
    commitUrl: commit.html_url,
    expectedContributor: input.expectedContributor,
    observedContributor: contributor,
    commitInRelease: true,
    evidenceHash: sha256Hex(canonicalJson(evidence))
  }
}
