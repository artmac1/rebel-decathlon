'use server'

import { Resend } from 'resend'

export type EmailPayload = {
  participantName: string
  total: number
  bandLabel: string
  completedAt: string | null
  attemptId: string
  scores: Array<{ label: string; points: number }>
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export async function sendResultsEmail(
  email: string,
  payload: EmailPayload
): Promise<{ success: true } | { error: string }> {
  if (!email || !email.includes('@')) {
    return { error: 'Please enter a valid email address.' }
  }

  const resultsUrl = `https://rebel-decathlon.vercel.app/results/${payload.attemptId}`

  const scoreRows = payload.scores
    .map(
      (s) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0">${escapeHtml(s.label)}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold">${s.points}/10</td>
        </tr>`
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:24px;color:#111">
        <h2 style="margin:0 0 4px">${escapeHtml(payload.participantName)}'s Rebel Decathlon Results</h2>
        ${payload.completedAt ? `<p style="color:#888;margin:0 0 24px;font-size:14px">Completed ${escapeHtml(payload.completedAt)}</p>` : ''}

        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <p style="font-size:56px;font-weight:bold;margin:0 0 4px">${payload.total}</p>
          <p style="color:#6b7280;font-size:14px;margin:0 0 8px">out of 100 points</p>
          <p style="font-weight:bold;font-size:18px;margin:0">${escapeHtml(payload.bandLabel)}</p>
        </div>

        <p style="margin-bottom:24px">
          <a href="${resultsUrl}" style="background:#111;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-size:14px">
            View your full results →
          </a>
        </p>

        <h3 style="font-size:14px;color:#374151;margin:0 0 8px">Event Breakdown</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <tbody>${scoreRows}</tbody>
        </table>
      </body>
    </html>
  `

  try {
    if (!process.env.RESEND_API_KEY) {
      return { error: 'Email service is not configured.' }
    }
    const resend = new Resend(process.env.RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? 'info@successfulaging.academy',
      to: email,
      subject: `${payload.participantName}'s Rebel Decathlon Results${payload.completedAt ? ` — ${payload.completedAt}` : ''}`,
      html,
    })

    if (error) return { error: 'Failed to send email. Please try again.' }
    return { success: true }
  } catch {
    return { error: 'Failed to send email. Please try again.' }
  }
}
