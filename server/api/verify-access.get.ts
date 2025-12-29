
import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const user = await serverSupabaseUser(event)

    if (!user || !user.id || user.id === 'undefined') {
        console.error('Invalid User Session:', user)
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Invalid session or missing User ID.'
        })
    }

    // Use Service Role Key to bypass RLS and strictly check permissions
    const config = useRuntimeConfig()
    // Robust key retrieval
    const supabaseUrl = process.env.SUPABASE_URL || config.public?.supabaseUrl
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
