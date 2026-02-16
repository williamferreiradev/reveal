import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function inspect() {
    const { data, error } = await supabase.from('users').select('*').limit(1)
    if (data && data.length > 0) {
        console.log('KEYS:', Object.keys(data[0]))
    }
}
inspect()
