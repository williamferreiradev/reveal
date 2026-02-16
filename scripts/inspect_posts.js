import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function inspect() {
    console.log('Fetching one post from feed_posts...')
    // Try to fetch with user expansion
    const { data, error } = await supabase
        .from('feed_posts')
        .select(`
            *,
            users:user_id (
                id,
                nome,
                fotos
            )
        `)
        .limit(1)

    if (error) {
        console.error('Error:', error)
    } else {
        console.log('Sample Post Structure:', JSON.stringify(data[0], null, 2))
    }
}

inspect()
