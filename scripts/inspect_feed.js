import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function inspect() {
    console.log('Fetching feed_posts for inspection...')
    // Fetch posts that might be problematic (e.g. valid user_id but maybe missing fields)
    const { data, error } = await supabase.from('feed_posts').select('id, user_id, tipo, conteudo_url, descricao').limit(10).order('created_at', { ascending: false })
    if (error) console.error('Error:', error)
    else console.log('Data:', JSON.stringify(data, null, 2))
}

inspect()
