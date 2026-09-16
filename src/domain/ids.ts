import { canonicalJson, sha256Hex } from './canonical-json.js'

export function intentId(candidateId: string, policyId: string, payloadHash: string): string {
  return `intent-${sha256Hex(canonicalJson({ candidateId, payloadHash, policyId })).slice(0, 24)}`
}

export function idempotencyKey(payloadHash: string): string {
  return `releaserail-${payloadHash}`
}
