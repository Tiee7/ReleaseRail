import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { PayoutProof } from '../domain/types.js'

const PUBLIC_FIELDS = new Set<keyof PayoutProof>([
  'intentId',
  'candidate',
  'policy',
  'recipientAddress',
  'sourceAddress',
  'amountBaseUnits',
  'canonicalPayloadHash',
  'keeperHubExecutionId',
  'transactionHash',
  'transactionLink',
  'receiptVerified',
  'duplicateReplay',
  'recordedAt',
])

const SECRET_PATTERNS = [
  /kh_(?:live|test)_[a-z0-9_-]+/i,
  /bearer\s+\S+/i,
  /(?:private[_ -]?key|secret)\s*[:=]\s*0x[0-9a-f]{64}/i,
]

function assertSafeValue(value: unknown, path: string): void {
  if (typeof value === 'string') {
    for (const pattern of SECRET_PATTERNS) {
      if (pattern.test(value)) throw new Error(`proof contains a credential-like value at ${path}`)
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertSafeValue(item, `${path}[${index}]`))
    return
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, nested] of Object.entries(value)) assertSafeValue(nested, `${path}.${key}`)
  }
}

function safeProof(proof: PayoutProof): PayoutProof {
  for (const key of Object.keys(proof) as Array<keyof PayoutProof>) {
    if (!PUBLIC_FIELDS.has(key)) throw new Error(`proof field is not public: ${String(key)}`)
  }
  assertSafeValue(proof, 'proof')
  return JSON.parse(JSON.stringify(proof)) as PayoutProof
}

function proofPath(directory: string, intentId: string): string {
  if (!/^[A-Za-z0-9_-]+$/.test(intentId)) throw new Error('invalid intentId for proof path')
  return join(directory, `${intentId}.json`)
}

export async function writeProof(proofDirectory: string, proof: PayoutProof): Promise<string> {
  const sanitized = safeProof(proof)
  const target = proofPath(proofDirectory, sanitized.intentId)
  await mkdir(proofDirectory, { recursive: true })
  const temporary = `${target}.${process.pid}.tmp`
  await writeFile(temporary, `${JSON.stringify(sanitized, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
  await rename(temporary, target)
  return target
}

export async function readProof(proofDirectory: string, intentId: string): Promise<PayoutProof | undefined> {
  const target = proofPath(proofDirectory, intentId)
  try {
    const parsed = JSON.parse(await readFile(target, 'utf8')) as PayoutProof
    if (parsed.intentId !== intentId) throw new Error('proof intentId does not match path')
    return safeProof(parsed)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return undefined
    throw error
  }
}
