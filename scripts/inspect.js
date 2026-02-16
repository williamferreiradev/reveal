import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import dotenv from 'dotenv'

// Manually parse .env since dotenv might not be installed or configured for this execution context
const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const SUPABASE_URL = envConfig.SUPABASE_URL
const SUPABASE_KEY = envConfig.SUPABASE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Credentials missing')
    process.exit(1)
}

// Fetch PostgREST root to see exposed resources
async function inspect() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        })

        if (!response.ok) {
            console.error('Failed to fetch OpenAPI schema:', response.status, response.statusText)
            return
        }

        const data = await response.json()

        console.log('--- FOUND TABLES (via API) ---')
        // PostgREST root returns an object where keys are table names (definitions)
        const tables = Object.keys(data.definitions || {})

        if (tables.length > 0) {
            tables.forEach(t => console.log(`- ${t}`))
        } else {
            // Fallback: PostgREST sometimes just returns docs or Swagger 2.0.
            // Let's try to query likely tables to see if they exist if introspection fails.
            console.log('No definitions found in root. Checking specific tables...')
        }

    } catch (e) {
        console.error('Error:', e)
    }
}

inspect()
