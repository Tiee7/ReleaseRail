import { describe, expect, it } from 'vitest'
import { canonicalJson } from '../../src/domain/canonical-json.js'

describe('canonicalJson', () => {
  it('sorts object keys recursively', () => {
    expect(canonicalJson({ b: 2, a: { d: true, c: 1 } })).toBe('{"a":{"c":1,"d":true},"b":2}')
  })

  it('preserves array order and string amounts', () => {
    expect(canonicalJson({ values: ['b', 'a'], amountBaseUnits: '1000' })).toBe('{"amountBaseUnits":"1000","values":["b","a"]}')
  })

  it('rejects undefined and non-finite values', () => {
    expect(() => canonicalJson({ value: undefined })).toThrow('undefined value')
    expect(() => canonicalJson({ value: Number.NaN })).toThrow('non-finite number')
  })
})
