import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import type { IntentStatus, PayoutIntent } from '../domain/types.js'

type IntentStoreFile = { intents: Record<string, PayoutIntent> }

export class IntentStoreConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'IntentStoreConflictError'
  }
}

export class IntentStore {
  private readonly filePath: string
  private readonly now: () => string

  constructor(directory: string, now: () => string = () => new Date().toISOString()) {
    this.filePath = join(directory, 'intents.json')
    this.now = now
  }

  async create(intent: PayoutIntent): Promise<PayoutIntent> {
    const state = await this.read()
    if (state.intents[intent.intentId] !== undefined) throw new IntentStoreConflictError(`intent already exists: ${intent.intentId}`)
    state.intents[intent.intentId] = intent
    await this.write(state)
    return intent
  }

  async get(intentId: string): Promise<PayoutIntent | undefined> {
    const state = await this.read()
    return state.intents[intentId]
  }

  async list(): Promise<PayoutIntent[]> {
    const state = await this.read()
    return Object.values(state.intents).sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
  }

  async transition(intentId: string, expectedStatus: IntentStatus, nextStatus: IntentStatus, patch: Partial<Pick<PayoutIntent, 'blockedReason' | 'executionOutcome' | 'executionId' | 'transactionHash' | 'transactionLink'>> = {}): Promise<PayoutIntent> {
    const state = await this.read()
    const current = state.intents[intentId]
    if (current === undefined) throw new IntentStoreConflictError(`intent not found: ${intentId}`)
    if (current.status !== expectedStatus) throw new IntentStoreConflictError(`expected ${expectedStatus}, found ${current.status}`)
    const updated: PayoutIntent = { ...current, ...patch, status: nextStatus, updatedAt: this.now() }
    state.intents[intentId] = updated
    await this.write(state)
    return updated
  }

  private async read(): Promise<IntentStoreFile> {
    try {
      const text = await readFile(this.filePath, 'utf8')
      const parsed = JSON.parse(text) as IntentStoreFile
      if (typeof parsed !== 'object' || parsed === null || typeof parsed.intents !== 'object' || parsed.intents === null) throw new Error('invalid intent store')
      return parsed
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return { intents: {} }
      throw error
    }
  }

  private async write(state: IntentStoreFile): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    const temporary = `${this.filePath}.${process.pid}.tmp`
    await writeFile(temporary, `${JSON.stringify(state, null, 2)}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temporary, this.filePath)
  }
}
