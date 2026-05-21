/**
 * Helper functions for URL manipulation and validation
 */

/**
 * Validate and normalize the base URL (NEXTAUTH_URL)
 * Ensure the URL has a protocol and does not end with a slash
 * 
 * @param url - URL to be validated
 * @returns Normalized URL or null if invalid
 */
export function normalizeBaseUrl(url: string | undefined): string | null {
  if (!url) {
    return null
  }

  // Remove spaces and trailing slashes
  let normalized = url.trim().replace(/\/+$/, '')

  // If no protocol, add https:// (assuming production)
  if (!normalized.match(/^https?:\/\//i)) {
    // In production, always use HTTPS
    if (process.env.NODE_ENV === 'production') {
      normalized = `https://${normalized}`
    } else {
      normalized = `http://${normalized}`
    }
  }

  // Basic URL validation
  try {
    const urlObj = new URL(normalized)
    // Ensure HTTPS in production
    if (process.env.NODE_ENV === 'production' && urlObj.protocol !== 'https:') {
      normalized = normalized.replace(/^http:/i, 'https:')
    }
    return normalized
  } catch (error) {
    console.error('Invalid URL format:', url, error)
    return null
  }
}

/**
 * Get the validated base URL from the environment
 * @returns URL base or throw error if not configured
 */
export function getBaseUrl(): string {
  const baseUrl = normalizeBaseUrl(process.env.NEXTAUTH_URL)
  
  if (!baseUrl) {
    const errorMessage = 
      process.env.NODE_ENV === 'production'
        ? 'NEXTAUTH_URL Not configured on Vercel. Configure as: https://www.site.com'
        : 'NEXTAUTH_URL Not configured on environment. Configure on .env.local file'
    
    console.error(errorMessage)
    throw new Error(errorMessage)
  }

  return baseUrl
}
