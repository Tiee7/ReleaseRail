export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>

export type GitHubRelease = {
  tag_name: string
  html_url: string
  target_commitish: string
}

export type GitHubCommit = {
  sha: string
  html_url: string
  author: { login?: string | null } | null
  committer: { login?: string | null } | null
  commit: {
    author: { name: string; email: string }
    committer: { name: string; email: string }
  }
}

export type GitHubRef = {
  object: { sha: string; type: string }
}

export type GitHubTag = {
  object: { sha: string; type: string }
}

export type GitHubComparison = {
  status: 'ahead' | 'behind' | 'identical' | 'diverged'
}

export class GitHubApiError extends Error {
  readonly status: number
  readonly path: string

  constructor(status: number, path: string, message: string) {
    super(`GitHub API ${status} for ${path}: ${message}`)
    this.name = 'GitHubApiError'
    this.status = status
    this.path = path
  }
}

export type GitHubClientOptions = {
  fetcher?: FetchLike
  token?: string
  baseUrl?: string
}

export class GitHubClient {
  private readonly fetcher: FetchLike
  private readonly token: string | undefined
  private readonly baseUrl: string

  constructor(options: GitHubClientOptions = {}) {
    this.fetcher = options.fetcher ?? fetch
    this.token = options.token ?? process.env.GITHUB_TOKEN
    this.baseUrl = (options.baseUrl ?? 'https://api.github.com').replace(/\/$/, '')
  }

  async getRelease(owner: string, repo: string, tag: string): Promise<GitHubRelease> {
    return this.get<GitHubRelease>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/releases/tags/${encodeURIComponent(tag)}`)
  }

  async getCommit(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
    return this.get<GitHubCommit>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits/${encodeURIComponent(sha)}`)
  }

  async getTagRef(owner: string, repo: string, tag: string): Promise<GitHubRef | GitHubTag> {
    const ref = await this.get<GitHubRef>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/tags/${encodeURIComponent(tag)}`)
    if (ref.object.type !== 'tag') return ref
    return this.get<GitHubTag>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/tags/${encodeURIComponent(ref.object.sha)}`)
  }

  async compare(owner: string, repo: string, base: string, head: string): Promise<GitHubComparison> {
    return this.get<GitHubComparison>(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`)
  }

  private async get<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'ReleaseRail/0.1'
    }
    if (this.token !== undefined && this.token.length > 0) headers.Authorization = `Bearer ${this.token}`
    const response = await this.fetcher(`${this.baseUrl}${path}`, { headers })
    if (!response.ok) {
      const body = await response.text()
      throw new GitHubApiError(response.status, path, body.slice(0, 240))
    }
    return response.json() as Promise<T>
  }
}
