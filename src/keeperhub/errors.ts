export class KeeperHubApiError extends Error {
  readonly status: number
  readonly path: string

  constructor(status: number, path: string, message: string) {
    super(`KeeperHub API ${status} for ${path}: ${redact(message)}`)
    this.name = 'KeeperHubApiError'
    this.status = status
    this.path = path
  }
}

export function redact(value: string): string {
  return value
    .replace(/kh_[A-Za-z0-9_-]+/g, '[redacted-key]')
    .replace(/Bearer\s+[^\s"']+/gi, 'Bearer [redacted]')
    .slice(0, 400)
}
