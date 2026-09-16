import { createHash } from 'node:crypto'

type JsonPrimitive = null | boolean | number | string
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue }

function normalize(value: unknown, path: string): JsonValue {
  if (value === null || typeof value === 'boolean' || typeof value === 'string') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`non-finite number at ${path}`)
    return value
  }
  if (typeof value === 'undefined') throw new TypeError(`undefined value at ${path}`)
  if (typeof value === 'bigint' || typeof value === 'function' || typeof value === 'symbol') {
    throw new TypeError(`unsupported value at ${path}`)
  }
  if (Array.isArray(value)) return value.map((item, index) => normalize(item, `${path}[${index}]`))
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(
      Object.keys(record)
        .sort()
        .map((key) => [key, normalize(record[key], `${path}.${key}`)])
    )
  }
  throw new TypeError(`unsupported value at ${path}`)
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalize(value, '$'))
}

export function sha256Hex(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}
