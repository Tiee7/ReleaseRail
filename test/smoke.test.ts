import { describe, expect, it } from 'vitest'
import { productName } from '../src/index.js'

describe('project scaffold', () => {
  it('identifies the product', () => {
    expect(productName).toBe('ReleaseRail')
  })
})
