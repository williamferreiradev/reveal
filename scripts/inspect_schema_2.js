
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
    console.log('START_INSPECT_COLUMNS');
    const tables = ['feed_comments', 'feed_curtidas', 'feed_posts'];

    for (const table of tables) {
        console.log(`\n--- Columns for ${table} ---`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`Error fetching ${table}:`, error.message);
        } else if (data && data.length > 0) {
            console.log(Object.keys(data[0]));
        } else {
            console.log(`${table} is empty. Unable to list columns via select.`);
            // Attempt to insert a dummy row that will fail but reveal columns? No, dangerous.
        }
    }
    console.log('END_INSPECT_COLUMNS');
}

inspect()
