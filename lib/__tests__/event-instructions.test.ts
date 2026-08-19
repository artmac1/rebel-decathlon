import { describe, it, expect } from 'vitest'
import { EVENT_INSTRUCTIONS, ALL_EVENT_KEYS } from '../event-instructions'

describe('EVENT_INSTRUCTIONS', () => {
  it('every event has a vimeoId defined as a non-empty string', () => {
    for (const key of ALL_EVENT_KEYS) {
      const entry = EVENT_INSTRUCTIONS[key]
      expect(
        entry.vimeoId,
        `${key} is missing vimeoId`
      ).toBeDefined()
      expect(
        typeof entry.vimeoId,
        `${key}.vimeoId should be a string`
      ).toBe('string')
      expect(
        entry.vimeoId!.length,
        `${key}.vimeoId should not be empty`
      ).toBeGreaterThan(0)
      // Once all videos are uploaded to Vimeo, uncomment this:
      // expect(entry.vimeoId, `${key}.vimeoId is still a placeholder`).not.toBe('TODO')
    }
  })
})
