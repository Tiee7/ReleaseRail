import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import { createServiceFromEnvironment } from './runtime.js'
import { css, html, javascript } from './web/assets.js'
import type { DashboardDataSource } from './web/types.js'

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

export function createWebServer(source: DashboardDataSource): Server {
  return createServer(async (request: IncomingMessage, response: ServerResponse) => {
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET')
      sendJson(response, 405, { ok: false, error: 'method not allowed' })
      return
    }
    const path = new URL(request.url ?? '/', 'http://localhost').pathname
    if (path === '/') return send(response, 200, 'text/html', html)
    if (path === '/assets/app.css') return send(response, 200, 'text/css', css)
    if (path === '/assets/app.js') return send(response, 200, 'application/javascript', javascript)
    if (path === '/api/health') return sendJson(response, 200, { ok: true, service: 'ReleaseRail' })
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
