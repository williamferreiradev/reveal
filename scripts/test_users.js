import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

// Manually parse .env
const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function test() {
    console.log('Testing connection to users table...')
    const { data, error } = await supabase
        .from('users')
        .select('id, nome, email')
        .limit(5)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log(`Success! Found ${data.length} users.`)
        if (data.length > 0) {
            console.log('Sample:', data[0])
        } else {
            console.log('The array is empty. This usually means RLS (Row Level Security) is on and blocking access.')
        }
    }
}

test()
