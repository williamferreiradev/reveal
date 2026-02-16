
import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // 1. Extract Token from Header
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: No token provided.'
        })
    }

    // 2. Setup Config
    const config = useRuntimeConfig()
    const supabaseUrl = process.env.SUPABASE_URL || config.public?.supabaseUrl
    const supabaseAnonKey = process.env.SUPABASE_KEY || config.public?.supabaseKey
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || config.supabase?.serviceKey

    // Debug Log (Short)
    console.log('Verify-Access: Checking token...')

    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
        console.error('Server Config Error. Missing:', {
            url: !!supabaseUrl,
            anon: !!supabaseAnonKey,
            service: !!supabaseServiceKey
        })
        throw createError({
            statusCode: 500,
            statusMessage: 'Server Config Error: Missing Keys'
        })
    }

    // 3. Verify Token using Anon Client (Standard Auth Check)
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
        console.error('Token Verification Failed:', userError)
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Invalid token.'
        })
    }

    console.log('User Verified:', user.id)

    // 4. Verify Admin Access with Service Key (Bypass RLS)
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
        console.error('Database Error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: `Database error: ${error.message}`
        })
    }

    if (!data || !data.temacessoadm) {
        console.warn('User is NOT admin:', user.id)
        return { isAdmin: false }
    }

    console.log('Admin Access Granted:', user.id)
    return { isAdmin: true }
})
