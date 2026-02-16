import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function inspect() {
    console.log('Fetching admin_dashboard_stats...')
    const { data, error } = await supabase.from('admin_dashboard_stats').select('*').single()
    if (error) console.error('Error:', error)
    else console.log('Data:', data)
}

inspect()
