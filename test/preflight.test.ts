import { describe, expect, it } from 'vitest'
import { buildPreflightReport } from '../src/preflight.js'

describe('preflight', () => {
  it('reports missing live prerequisites without exposing values', () => {
    const report = buildPreflightReport({ keeperHubKeyPresent: false, rpcUrlPresent: false, policyFileConfigured: false, policyFileExists: false, mcpBuildExists: true, githubTokenPresent: true })
    expect(report).toEqual({ keeperHubKeyPresent: false, rpcUrlPresent: false, policyFileConfigured: false, policyFileExists: false, mcpBuildExists: true, githubTokenPresent: true, ready: false, githubTokenOptional: true })
  })

  it('becomes ready only when required checks pass', () => {
    const report = buildPreflightReport({ keeperHubKeyPresent: true, rpcUrlPresent: true, policyFileConfigured: true, policyFileExists: true, mcpBuildExists: true, githubTokenPresent: false })
    expect(report.ready).toBe(true)
  })
})
