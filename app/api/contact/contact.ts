"use server"

import { z } from "zod"

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().optional(),
})

function parseContactApiError(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null
  const body = payload as Record<string, unknown>

  if (Array.isArray(body.errors)) {
    const first = body.errors[0]
    if (first && typeof first === "object" && first !== null) {
      const msg = (first as Record<string, unknown>).message
      if (typeof msg === "string" && msg.trim()) return msg
    }
  }

  if (typeof body.message === "string" && body.message.trim()) {
    return body.message
  }

  if (typeof body.error === "string" && body.error.trim()) {
    return body.error
  }

  return null
}

export async function submitContactForm(prevState: unknown, formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  }

  const validatedFields = contactSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      success: false,
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: "Please fix the errors below.",
    }
  }

  const turnstileToken = String(formData.get("cf-turnstile-response") ?? "").trim()
  if (!turnstileToken) {
    return {
      success: false,
      message: "Please complete the human verification.",
    }
  }

  const backendUrl = process.env.BACKEND_API_URL
  if (!backendUrl) {
    return {
      success: false,
      message: "Service unavailable. Please try again later.",
    }
  }

  const payload = {
    ...validatedFields.data,
    turnstile_token: turnstileToken,
  }

  try {
    const response = await fetch(`${backendUrl}/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      let errorMessage = "Failed to send message. Please try again later."
      try {
        const errorBody = await response.json()
        const parsed = parseContactApiError(errorBody)
        if (parsed) errorMessage = parsed
      } catch {
        // ignore parse errors
      }
      return { success: false, message: errorMessage }
    }

    return { success: true, message: "Message sent successfully!" }
  } catch {
    return {
      success: false,
      message: "Failed to send message. Please try again later.",
    }
  }
}
