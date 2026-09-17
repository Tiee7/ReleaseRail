import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { createServiceFromEnvironment } from './runtime.js'
import { css, html, javascript } from './web/assets.js'
import type { DashboardDataSource } from './web/types.js'

const MAX_ACTION_BODY_BYTES = 16 * 1024

function send(response: ServerResponse, status: number, contentType: string, body: string): void {
  response.writeHead(status, {
    'Content-Type': `${contentType}; charset=utf-8`,
    'Cache-Control': 'no-store',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  })
  response.end(body)
}

function sendJson(response: ServerResponse, status: number, body: unknown): void {
  send(response, status, 'application/json', JSON.stringify(body))
}

async function readJson(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_ACTION_BODY_BYTES) throw new Error('request body is too large')
    chunks.push(buffer)
  }
  if (size === 0) return {}
  const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString('utf8'))
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) throw new Error('request body must be a JSON object')
  return parsed as Record<string, unknown>
}

function requiredString(body: Record<string, unknown>, field: string): string {
  const value = body[field]
  if (typeof value !== 'string' || value.length === 0) throw new Error(`${field} is required`)
  return value
}

export function createWebServer(source: DashboardDataSource): Server {
  return createServer(async (request: IncomingMessage, response: ServerResponse) => {
    const path = new URL(request.url ?? '/', 'http://localhost').pathname
    const actionMatch = /^\/api\/payouts\/([A-Za-z0-9_-]+)\/(approve|simulate|execute)$/.exec(path)
    if (request.method !== 'GET' && !(request.method === 'POST' && actionMatch !== null)) {
      response.setHeader('Allow', 'GET')
      sendJson(response, 405, { ok: false, error: 'method not allowed' })
      return
    }
    if (path === '/') return send(response, 200, 'text/html', html)
    if (path === '/assets/app.css') return send(response, 200, 'text/css', css)
    if (path === '/assets/app.js') return send(response, 200, 'application/javascript', javascript)
    if (path === '/api/health') return sendJson(response, 200, { ok: true, service: 'ReleaseRail' })
    if (actionMatch !== null) {
      if (request.method !== 'POST') {
        response.setHeader('Allow', 'POST')
        return sendJson(response, 405, { ok: false, error: 'method not allowed' })
      }
      if (request.headers['x-releaserail-action'] !== 'confirm') {
        return sendJson(response, 403, { ok: false, error: 'explicit action confirmation is required' })
      }
      try {
        const intentId = actionMatch[1]
        const action = actionMatch[2]
        if (intentId === undefined || action === undefined) throw new Error('invalid payout action')
        const body = await readJson(request)
        let data: unknown
        if (action === 'approve') {
          if (source.approvePayout === undefined) return sendJson(response, 501, { ok: false, error: 'approve action is unavailable' })
          data = await source.approvePayout(intentId, requiredString(body, 'expectedIntentHash'))
        } else if (action === 'simulate') {
          if (source.simulatePayout === undefined) return sendJson(response, 501, { ok: false, error: 'simulate action is unavailable' })
          data = await source.simulatePayout(intentId)
        } else {
          if (source.executePayout === undefined) return sendJson(response, 501, { ok: false, error: 'execute action is unavailable' })
          data = await source.executePayout(intentId, requiredString(body, 'expectedIntentHash'))
        }
        return sendJson(response, 200, { ok: true, data })
      } catch (error) {
        return sendJson(response, 400, { ok: false, error: error instanceof Error ? error.message : 'action failed' })
      }
    }
    if (path === '/api/dashboard') {
      try {
        return sendJson(response, 200, await source.getDashboardSnapshot())
      } catch (error) {
        console.error('[ReleaseRail web] dashboard read failed', error)
        return sendJson(response, 500, { ok: false, error: 'dashboard unavailable' })
      }
    }
    sendJson(response, 404, { ok: false, error: 'not found' })
  })
}

export async function runWebServer(): Promise<void> {
  const host = process.env.RELEASERAIL_WEB_HOST ?? '127.0.0.1'
  const port = Number(process.env.RELEASERAIL_WEB_PORT ?? '4782')
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error('RELEASERAIL_WEB_PORT must be an integer between 0 and 65535')
  const server = createWebServer(await createServiceFromEnvironment())
  await new Promise<void>((resolve) => server.listen(port, host, resolve))
  process.stdout.write(`ReleaseRail web console listening at http://${host}:${port}\n`)
}

if (process.argv[1]?.endsWith('/web-server.ts') === true || process.argv[1]?.endsWith('/web-server.js') === true) {
  runWebServer().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : 'unknown error'}\n`)
    process.exitCode = 1
  })
}
