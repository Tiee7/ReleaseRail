import { access } from 'node:fs/promises'
import { join, resolve } from 'node:path'

export type PreflightInputs = {
  keeperHubKeyPresent: boolean
  rpcUrlPresent: boolean
  policyFileConfigured: boolean
  policyFileExists: boolean
  mcpBuildExists: boolean
  githubTokenPresent: boolean
}

export type PreflightReport = PreflightInputs & {
  ready: boolean
  githubTokenOptional: true
}

export function buildPreflightReport(inputs: PreflightInputs): PreflightReport {
  return {
    ...inputs,
    ready: inputs.keeperHubKeyPresent && inputs.rpcUrlPresent && inputs.policyFileExists && inputs.mcpBuildExists,
    githubTokenOptional: true,
  }
}

export async function inspectPreflight(cwd = process.cwd(), env: NodeJS.ProcessEnv = process.env): Promise<PreflightReport> {
  const policyPath = resolve(cwd, env.RELEASERAIL_POLICY_FILE ?? 'integrations/ezdsh/payout-policy.json')
  const buildPath = join(cwd, 'dist/mcp-server.js')
  const exists = async (path: string): Promise<boolean> => {
    try {
      await access(path)
      return true
    } catch {
      return false
    }
  }
  return buildPreflightReport({
    keeperHubKeyPresent: typeof env.KEEPERHUB_API_KEY === 'string' && env.KEEPERHUB_API_KEY.length > 0,
    rpcUrlPresent: typeof env.RELEASERAIL_RPC_URL === 'string' && env.RELEASERAIL_RPC_URL.length > 0,
    policyFileConfigured: typeof env.RELEASERAIL_POLICY_FILE === 'string' && env.RELEASERAIL_POLICY_FILE.length > 0,
    policyFileExists: await exists(policyPath),
    mcpBuildExists: await exists(buildPath),
    githubTokenPresent: typeof env.GITHUB_TOKEN === 'string' && env.GITHUB_TOKEN.length > 0,
  })
}

if (process.argv[1]?.endsWith('/preflight.ts') === true || process.argv[1]?.endsWith('/preflight.js') === true) {
  inspectPreflight().then((report) => {
    process.stdout.write(`${JSON.stringify({ ok: report.ready, report }, null, 2)}\n`)
    if (!report.ready) process.exitCode = 1
  }).catch((error: unknown) => {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' })}\n`)
    process.exitCode = 1
  })
}
