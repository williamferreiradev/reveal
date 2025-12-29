import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function listTables() {
    // PostgREST doesn't support listing tables directly via API usually, 
    // but we can try to infer from common names or check if a table query works.
    const potentialTables = ['matches', 'interactions', 'likes', 'comments', 'reports']

    console.log('Checking existence of potential tables...')

    for (const table of potentialTables) {
        const { error } = await supabase.from(table).select('*').limit(1)
        if (!error) {
            console.log(`[EXISTS] ${table}`)
        } else {
            console.log(`[MISSING] ${table} - Error: ${error.message} (${error.code})`)
        }
    }
}

listTables()
