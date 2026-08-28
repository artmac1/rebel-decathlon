import { describe, it, expect, vi, beforeEach } from 'vitest'

// vi.hoisted lets us reference mockSend inside the vi.mock factory
const mockSend = vi.hoisted(() => vi.fn())

vi.mock('resend', () => ({
  // Must use `function` keyword (not arrow) so vi.fn() can be called with `new`
  Resend: vi.fn().mockImplementation(function () {
    return { emails: { send: mockSend } }
  }),
}))

import { sendResultsEmail } from './actions'

const payload = {
  participantName: 'Jane',
  total: 65,
  bandLabel: 'Hardened Warrior',
  completedAt: 'August 1, 2026',
  attemptId: 'abc-123',
  scores: [
    { label: 'Push-Up Test', points: 7 },
    { label: 'Squat Test', points: 4 },
  ],
}

describe('sendResultsEmail', () => {
  beforeEach(() => {
    mockSend.mockResolvedValue({ error: null })
  })

  it('returns error for empty email', async () => {
    const result = await sendResultsEmail('', payload)
    expect(result).toEqual({ error: 'Please enter a valid email address.' })
  })

  it('returns error for email with no @', async () => {
    const result = await sendResultsEmail('notanemail', payload)
    expect(result).toEqual({ error: 'Please enter a valid email address.' })
  })

  it('returns success when Resend sends successfully', async () => {
    const result = await sendResultsEmail('jane@example.com', payload)
    expect(result).toEqual({ success: true })
  })

  it('calls Resend with correct subject containing participant name and date', async () => {
    await sendResultsEmail('jane@example.com', payload)
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.subject).toContain('Jane')
    expect(callArgs.subject).toContain('August 1, 2026')
  })

  it('calls Resend with html containing the results URL', async () => {
    await sendResultsEmail('jane@example.com', payload)
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.html).toContain('abc-123')
  })

  it('calls Resend with html containing all event scores', async () => {
    await sendResultsEmail('jane@example.com', payload)
    const callArgs = mockSend.mock.calls[0][0]
    expect(callArgs.html).toContain('Push-Up Test')
    expect(callArgs.html).toContain('Squat Test')
  })

  it('returns error when Resend returns an error object', async () => {
    mockSend.mockResolvedValueOnce({ error: { message: 'domain not verified' } })
    const result = await sendResultsEmail('jane@example.com', payload)
    expect(result).toEqual({ error: 'Failed to send email. Please try again.' })
  })

  it('returns error when Resend throws', async () => {
    mockSend.mockRejectedValueOnce(new Error('network failure'))
    const result = await sendResultsEmail('jane@example.com', payload)
    expect(result).toEqual({ error: 'Failed to send email. Please try again.' })
  })
})
