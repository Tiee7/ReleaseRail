import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'
import { createServiceFromEnvironment } from './runtime.js'
import type { ReleaseRailService } from './releaserail-service.js'

function result(value: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] }
}

export function createMcpServer(service: ReleaseRailService): McpServer {
  const server = new McpServer({ name: 'ReleaseRail', version: '0.1.0' })
  server.registerTool('release_candidate', {
    description: 'Verify that a named GitHub contribution is included in a named release.',
    inputSchema: { repository: z.string(), tag: z.string(), contributionCommit: z.string(), expectedContributor: z.string() },
  }, async (input) => result(await service.releaseCandidate(input)))
  server.registerTool('prepare_payout', {
    description: 'Create a deterministic, local payout intent from verified release evidence and a configured policy.',
    inputSchema: { candidateId: z.string(), policyId: z.string(), recipientAddress: z.string(), amountBaseUnits: z.string(), reason: z.string() },
  }, async (input) => result(await service.preparePayout({ ...input, recipientAddress: input.recipientAddress as `0x${string}` })))
  server.registerTool('approve_payout', {
    description: 'Approve exactly one payout intent by its canonical hash.',
    inputSchema: { intentId: z.string(), expectedIntentHash: z.string() },
  }, async (input) => result(await service.approvePayout(input.intentId, input.expectedIntentHash)))
  server.registerTool('simulate_payout', {
    description: 'Run KeeperHub preflight simulation without broadcasting.',
    inputSchema: { intentId: z.string() },
  }, async (input) => result(await service.simulatePayout(input.intentId)))
  server.registerTool('execute_payout', {
    description: 'Execute an approved and simulated payout with stable idempotency, then verify its receipt.',
    inputSchema: { intentId: z.string(), expectedIntentHash: z.string() },
  }, async (input) => result(await service.executePayout(input.intentId, input.expectedIntentHash)))
  server.registerTool('get_payout_proof', {
    description: 'Load the redacted public proof bundle for a payout intent.',
    inputSchema: { intentId: z.string() },
  }, async (input) => result(await service.getPayoutProof(input.intentId)))
  return server
}

export async function runMcpServer(): Promise<void> {
  const server = createMcpServer(await createServiceFromEnvironment())
  await server.connect(new StdioServerTransport())
}

if (process.argv[1]?.endsWith('/mcp-server.ts') === true || process.argv[1]?.endsWith('/mcp-server.js') === true) {
  runMcpServer().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : 'unknown error'}\n`)
    process.exitCode = 1
  })
}
