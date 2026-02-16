import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function inspect() {
    console.log('Fetching one user to see all columns...')
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else {
        if (data.length > 0) {
            console.log('User Columns:', Object.keys(data[0]))
            console.log('Sample User:', data[0])
        } else {
            console.log('No users found.')
        }
    }
}

inspect()
