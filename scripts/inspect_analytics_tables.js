import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function inspect() {
    console.log('Inspecting matches...')
    const { data: mData } = await supabase.from('matches').select('*').limit(1)
    if (mData && mData.length) console.log('Matches keys:', Object.keys(mData[0]))

    console.log('Inspecting likes...')
    const { data: lData } = await supabase.from('likes').select('*').limit(1)
    if (lData && lData.length) console.log('Likes keys:', Object.keys(lData[0]))
}

inspect()
