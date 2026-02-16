
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

    if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server Config Error: Missing Keys'
        })
    }

    // 3. Verify Token
    const supabase = createClient(supabaseUrl, supabaseAnonKey!)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized: Invalid token.'
        })
    }

    // 4. Fetch Profile with Service Key (Bypass RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const { data: profileData, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (error || !profileData) {
        console.warn('Profile not found in public.users, returning auth fallback:', error?.message)
        return {
            nome: user.user_metadata?.name || user.email?.split('@')[0] || 'Usuário',
            fotos: user.user_metadata?.avatar_url || null,
            temacessoadm: false,
            email: user.email
        }
    }

    return profileData
})
