
import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    // DEBUG LOGS
    const cookies = getHeader(event, 'cookie') || ''
    const config = useRuntimeConfig()
    const url = process.env.SUPABASE_URL || config.public?.supabaseUrl || 'MISSING'

    console.log('--- VERIFY ACCESS DEBUG ---')
    console.log('Cookies present:', !!cookies)
    console.log('Supabase URL Config:', url)
    console.log('User found:', user ? user.id : 'NO USER')

    if (!user || !user.id || user.id === 'undefined') {
        const debugInfo = {
            cookiesPresent: !!cookies,
            supabaseUrlStart: url ? url.substring(0, 15) + '...' : 'MISSING',
            hasServiceKey: !!(process.env.SUPABASE_SERVICE_KEY || config.supabase?.serviceKey)
        }
        console.error('Invalid User Session:', debugInfo)

        throw createError({
            statusCode: 401,
            statusMessage: `Unauth Debug: Cookies=${debugInfo.cookiesPresent}, URL=${debugInfo.supabaseUrlStart}, SvcKey=${debugInfo.hasServiceKey}`,
            data: debugInfo
        })
    }

    // Use Service Role Key to bypass RLS and strictly check permissions
    // config variable already defined above
    // Robust key retrieval
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || config.supabase?.serviceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('Server Config Error: URL or Service Key missing.')
        console.error('URL Present:', !!supabaseUrl)
        console.error('Key Present:', !!supabaseServiceKey)
        throw createError({
            statusCode: 500,
            statusMessage: 'Configuration error on server.'
        })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const { data, error } = await supabaseAdmin
        .from('users')
        .select('temacessoadm')
        .eq('user_id', user.id)
        .single()

    if (error) {
        console.error('SERVER VERIFY ERROR:', error)
        console.error('User ID being checked:', user.id)
        throw createError({
            statusCode: 500,
            statusMessage: `Database error: ${error.message} (${error.code})`
        })
    }

    if (!data || !data.temacessoadm) {
        console.warn('User found but NOT Admin. ID:', user.id)
        return { isAdmin: false }
    }

    console.log('Admin Access Verified for:', user.id)
    return { isAdmin: true }
})
