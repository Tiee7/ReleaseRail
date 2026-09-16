import { describe, expect, it } from 'vitest'
import { createMcpServer } from '../src/mcp-server.js'
import type { ReleaseRailService } from '../src/releaserail-service.js'

describe('MCP adapter', () => {
  it('exposes only the six reviewable ReleaseRail tools', () => {
    const service = {} as ReleaseRailService
    const server = createMcpServer(service)
    const tools = (server as unknown as { _registeredTools: Record<string, unknown> })._registeredTools
    expect(Object.keys(tools).sort()).toEqual(['approve_payout', 'execute_payout', 'get_payout_proof', 'prepare_payout', 'release_candidate', 'simulate_payout'])
  })
})
