
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function inspectSchema() {
    console.log('START_READ_KEYS');

    // 1. feed_comments
    console.log('\n--- feed_comments Keys ---');
    const { data: cData } = await supabase.from('feed_comments').select('*').limit(1);
    if (cData && cData.length > 0) {
        console.log(Object.keys(cData[0]));
    } else {
        console.log('Still empty. Inserting dummy...');
        await supabase.from('feed_comments').insert({});
        const { data: cData2 } = await supabase.from('feed_comments').select('*').limit(1);
        if (cData2 && cData2.length > 0) console.log(Object.keys(cData2[0]));
    }

    // 2. feed_curtidas
    console.log('\n--- feed_curtidas Keys ---');
    const { data: lData } = await supabase.from('feed_curtidas').select('*').limit(1);
    if (lData && lData.length > 0) {
        console.log(Object.keys(lData[0]));
    } else {
        console.log('Still empty. Inserting dummy...');
        await supabase.from('feed_curtidas').insert({});
        const { data: lData2 } = await supabase.from('feed_curtidas').select('*').limit(1);
        if (lData2 && lData2.length > 0) console.log(Object.keys(lData2[0]));
    }

    console.log('END_READ_KEYS');
}

inspectSchema()
