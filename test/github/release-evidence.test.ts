import { describe, expect, it, vi } from 'vitest'
import { GitHubClient, type FetchLike } from '../../src/github/github-client.js'
import { buildReleaseCandidate } from '../../src/github/release-evidence.js'

function clientFor(routes: Record<string, unknown>): { client: GitHubClient; calls: string[] } {
  const calls: string[] = []
  const fetcher: FetchLike = vi.fn(async (input) => {
    calls.push(input)
    const value = routes[new URL(input).pathname + new URL(input).search]
    if (value === undefined) return new Response('not found', { status: 404 })
    return new Response(JSON.stringify(value), { status: 200, headers: { 'content-type': 'application/json' } })
  })
  return { client: new GitHubClient({ fetcher, baseUrl: 'https://github.test' }), calls }
}

function routes(status: 'ahead' | 'behind' = 'ahead'): Record<string, unknown> {
  return {
    '/repos/Tiee7/EzDSH/releases/tags/v1.8.1559': { tag_name: 'v1.8.1559', html_url: 'https://github.com/Tiee7/EzDSH/releases/tag/v1.8.1559', target_commitish: 'main' },
    '/repos/Tiee7/EzDSH/git/ref/tags/v1.8.1559': { object: { sha: 'release-sha', type: 'commit' } },
    '/repos/Tiee7/EzDSH/commits/contribution-sha': { sha: 'contribution-sha', html_url: 'https://github.com/Tiee7/EzDSH/commit/contribution-sha', author: { login: 'WalkmanHenry' }, committer: { login: 'WalkmanHenry' }, commit: { author: { name: 'Walkman', email: 'walkman@example.test' }, committer: { name: 'Walkman', email: 'walkman@example.test' } } },
    '/repos/Tiee7/EzDSH/compare/contribution-sha...release-sha': { status }
  }
}

describe('buildReleaseCandidate', () => {
  it('accepts a contribution reachable from an EzDSH release', async () => {
    const { client } = clientFor(routes())
    const result = await buildReleaseCandidate({ repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', contributionCommit: 'contribution-sha', expectedContributor: 'WalkmanHenry' }, client)
    expect(result).toMatchObject({ repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', observedContributor: 'WalkmanHenry', commitInRelease: true })
    expect(result.evidenceHash).toMatch(/^[0-9a-f]{64}$/)
  })

  it('rejects a contribution that is not an ancestor of the release', async () => {
    const { client } = clientFor(routes('behind'))
    await expect(buildReleaseCandidate({ repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', contributionCommit: 'contribution-sha', expectedContributor: 'WalkmanHenry' }, client)).rejects.toThrow('not reachable')
  })

  it('rejects a contributor mismatch before any payout layer can run', async () => {
    const { client } = clientFor(routes())
    await expect(buildReleaseCandidate({ repository: 'Tiee7/EzDSH', tag: 'v1.8.1559', contributionCommit: 'contribution-sha', expectedContributor: 'someone-else' }, client)).rejects.toThrow('contributor mismatch')
  })
})
