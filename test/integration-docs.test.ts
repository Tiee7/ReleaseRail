import { readFile } from 'node:fs/promises'
import { describe, expect, it } from 'vitest'

const secretLike = /kh_(?:live|test)_[A-Za-z0-9_-]+|Bearer [A-Za-z0-9._-]+|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i

describe('EzDSH integration package', () => {
  it('contains runnable MCP configuration and a credential-free policy example', async () => {
    const configText = await readFile(new URL('../integrations/ezdsh/mcp-config.json', import.meta.url), 'utf8')
    const policyText = await readFile(new URL('../integrations/ezdsh/payout-policy.example.json', import.meta.url), 'utf8')
    const config = JSON.parse(configText) as { mcpServers: { releaserail: { command: string; args: string[] } } }
    const policy = JSON.parse(policyText) as { asset: string; chainId: number; recipients: Record<string, string> }
    expect(config.mcpServers.releaserail).toMatchObject({ command: 'node', args: ['dist/mcp-server.js'] })
    expect(policy).toMatchObject({ asset: 'native', chainId: 84532 })
    expect(Object.values(policy.recipients)[0]).toMatch(/^0x[0-9a-f]{40}$/)
    expect(secretLike.test(configText)).toBe(false)
    expect(secretLike.test(policyText)).toBe(false)
  })
})
