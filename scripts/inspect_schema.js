import { createClient } from '@supabase/supabase-js'
import fs from 'fs'

const envConfig = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
    const [key, val] = line.split('=')
    if (key && val) acc[key.trim()] = val.trim()
    return acc
}, {})

const supabase = createClient(envConfig.SUPABASE_URL, envConfig.SUPABASE_KEY)

async function checkTable(tableName) {
    console.log(`\n--- Inspecting ${tableName} ---`)
    const { data, error } = await supabase.from(tableName).select('*').limit(1)
    if (error) {
        console.error(`Error fetching ${tableName}:`, error.message)
    } else {
        if (data.length > 0) {
            console.log(`Keys for ${tableName}:`, Object.keys(data[0]))
        } else {
            console.log(`Table ${tableName} exists but is empty.`)
        }
    }
}

async function inspect() {
    await checkTable('users')
    await checkTable('matches')
    await checkTable('messages')
    await checkTable('chat_messages') // Trying alternative name
    await checkTable('chats')          // Trying alternative name
    await checkTable('likes')
    await checkTable('stories')
    await checkTable('feed_posts')
}

inspect()
