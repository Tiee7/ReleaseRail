import { createServiceFromEnvironment } from './runtime.js'

type Arguments = { command: string; options: Record<string, string> }

function parseArguments(argv: string[]): Arguments {
  const [command = 'help', ...rest] = argv
  const options: Record<string, string> = {}
  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (token === undefined || !token.startsWith('--')) throw new Error(`unexpected argument: ${token ?? ''}`)
    const key = token.slice(2)
    const value = rest[index + 1]
    if (value === undefined || value.startsWith('--')) throw new Error(`missing value for --${key}`)
    options[key] = value
    index += 1
  }
  return { command, options }
}

function required(options: Record<string, string>, name: string): string {
  const value = options[name]
  if (value === undefined || value.length === 0) throw new Error(`--${name} is required`)
  return value
}

function printResult(summary: string, data: unknown): void {
  process.stdout.write(`${JSON.stringify({ ok: true, summary, data }, null, 2)}\n`)
}

export function helpText(): string {
  return `ReleaseRail CLI\n\nCommands:\n  candidate --repository owner/name --tag vX --contribution-commit sha --expected-contributor login\n  prepare --candidate-id id --policy-id id --recipient-address 0x... --amount-base-units integer --reason text\n  approve --intent-id id --expected-intent-hash hash\n  simulate --intent-id id\n  execute --intent-id id --expected-intent-hash hash\n  proof --intent-id id\n\nEnvironment:\n  RELEASERAIL_POLICY_FILE, RELEASERAIL_STATE_DIR, RELEASERAIL_PROOF_DIR\n  GITHUB_TOKEN, KEEPERHUB_API_KEY, KEEPERHUB_BASE_URL, RELEASERAIL_RPC_URL`
}

export async function runCli(argv: string[]): Promise<void> {
  const { command, options } = parseArguments(argv)
  if (command === 'help' || command === '--help' || command === '-h') {
    process.stdout.write(`${helpText()}\n`)
    return
  }
  const service = await createServiceFromEnvironment()
  switch (command) {
    case 'candidate': {
      const candidate = await service.releaseCandidate({ repository: required(options, 'repository'), tag: required(options, 'tag'), contributionCommit: required(options, 'contribution-commit'), expectedContributor: required(options, 'expected-contributor') })
      printResult('release contribution verified', candidate)
      return
    }
    case 'prepare': {
      const intent = await service.preparePayout({ candidateId: required(options, 'candidate-id'), policyId: required(options, 'policy-id'), recipientAddress: required(options, 'recipient-address') as `0x${string}`, amountBaseUnits: required(options, 'amount-base-units'), reason: required(options, 'reason') })
      printResult('payout intent prepared; approval is still required', intent)
      return
    }
    case 'approve': {
      const intent = await service.approvePayout(required(options, 'intent-id'), required(options, 'expected-intent-hash'))
      printResult('payout intent approved', intent)
      return
    }
    case 'simulate': {
      const result = await service.simulatePayout(required(options, 'intent-id'))
      printResult('KeeperHub simulation completed', result)
      return
    }
    case 'execute': {
      const result = await service.executePayout(required(options, 'intent-id'), required(options, 'expected-intent-hash'))
      printResult('payout execution reconciled; inspect verification and proof', result)
      return
    }
    case 'proof': {
      const proof = await service.getPayoutProof(required(options, 'intent-id'))
      printResult(proof === undefined ? 'no proof bundle exists yet' : 'redacted payout proof loaded', proof)
      return
    }
    default:
      throw new Error(`unknown command: ${command}`)
  }
}

if (process.argv[1]?.endsWith('/cli.ts') === true || process.argv[1]?.endsWith('/cli.js') === true) {
  runCli(process.argv.slice(2)).catch((error: unknown) => {
    process.stderr.write(`${JSON.stringify({ ok: false, error: error instanceof Error ? error.message : 'unknown error' })}\n`)
    process.exitCode = 1
  })
}
