// Load non-sensitive test defaults first; then let any local .env.local values
// fill in without overwriting what .env.test already set.
// Note: next/jest also loads .env.test automatically — this call is explicit
// documentation of the loading order and a fallback for tooling that bypasses
// the Next.js jest transformer.
require('dotenv').config({ path: '.env.test' })
require('dotenv').config({ path: '.env.local', override: false })

require('@testing-library/jest-dom')
