/**
 * GoHighLevel API v2 client — Phase 4b
 *
 * Server-only module. Never import from client components.
 * Reads GHL_PRIVATE_INTEGRATION_TOKEN and GHL_LOCATION_ID from env.
 *
 * Custom fields referenced below must be pre-created in GHL:
 *   Settings → Custom Fields → Contacts
 *   Key: decathlon_resume_url  (Text)
 *   Key: decathlon_total_score (Number)
 *
 * All exported functions swallow GHL errors so an outage never
 * blocks a participant from completing their assessment.
 */

const GHL_BASE = 'https://services.leadconnectorhq.com'
const GHL_VERSION = '2021-07-28'

function ghlHeaders(): Record<string, string> {
  const token = process.env.GHL_PRIVATE_INTEGRATION_TOKEN
  if (!token) throw new Error('[GHL] GHL_PRIVATE_INTEGRATION_TOKEN is not set')
  return {
    Authorization: `Bearer ${token}`,
    Version: GHL_VERSION,
    'Content-Type': 'application/json',
  }
}

export type GhlCustomField = {
  /** Snake_case key matching the field in GHL Settings → Custom Fields */
  key: string
  field_value: string | number
}

export type UpsertGhlContactParams = {
  firstName: string
  email: string
  /** Tags to ADD — additive in GHL, existing tags are preserved */
  tags?: string[]
  /** Tags to REMOVE — requires a separate DELETE after the upsert */
  removeTags?: string[]
  customFields?: GhlCustomField[]
}

/**
 * Creates or updates a GHL contact matched by email.
 * If removeTags is provided, fetches the contact ID from the upsert
 * response and issues a separate DELETE /contacts/{id}/tags call.
 *
 * Never throws. Logs errors with enough context to debug later.
 */
export async function upsertGhlContact({
  firstName,
  email,
  tags = [],
  removeTags = [],
  customFields = [],
}: UpsertGhlContactParams): Promise<void> {
  const locationId = process.env.GHL_LOCATION_ID
  if (!locationId) {
    console.error('[GHL] GHL_LOCATION_ID is not set — skipping upsert')
    return
  }

  try {
    const headers = ghlHeaders()

    // Upsert contact (create or update by email)
    const upsertRes = await fetch(`${GHL_BASE}/contacts/upsert`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        locationId,
        firstName,
        email,
        ...(tags.length > 0 && { tags }),
        ...(customFields.length > 0 && { customFields }),
      }),
    })

    if (!upsertRes.ok) {
      const body = await upsertRes.text()
      console.error(
        `[GHL] upsert failed — status ${upsertRes.status} for ${email} — ${body}`
      )
      return
    }

    const data = await upsertRes.json() as { contact?: { id?: string } }
    const contactId = data?.contact?.id

    if (!contactId) {
      console.error('[GHL] upsert succeeded but response had no contact.id:', JSON.stringify(data))
      return
    }

    // Tags are additive on upsert — remove stale tags with a separate call
    if (removeTags.length > 0) {
      const removeRes = await fetch(`${GHL_BASE}/contacts/${contactId}/tags`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ tags: removeTags }),
      })
      if (!removeRes.ok) {
        const body = await removeRes.text()
        console.error(
          `[GHL] tag removal failed — status ${removeRes.status} for contact ${contactId} (${email}) — ${body}`
        )
        // Non-fatal: contact was upserted successfully, tag cleanup failed
      }
    }
  } catch (err) {
    console.error(`[GHL] upsertGhlContact threw for ${email}:`, err)
  }
}
