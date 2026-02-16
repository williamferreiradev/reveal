
import { serverSupabaseUser } from '#supabase/server'
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    // 1. Extract Token
    const authHeader = getHeader(event, 'authorization')
    const token = authHeader?.replace('Bearer ', '')

    if (!token) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 2. Setup Config
    const config = useRuntimeConfig()
    const supabaseUrl = process.env.SUPABASE_URL || config.public?.supabaseUrl
    const supabaseAnonKey = process.env.SUPABASE_KEY || config.public?.supabaseKey
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || config.supabase?.serviceKey

    if (!supabaseUrl || !supabaseServiceKey) {
        throw createError({ statusCode: 500, statusMessage: 'Server Config Error' })
    }

    // 3. Verify User
    const supabase = createClient(supabaseUrl, supabaseAnonKey!)
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
    }

    // 4. Get Body
    const body = await readBody(event)
    const { nome, fotos } = body

    if (!nome) {
        throw createError({ statusCode: 400, statusMessage: 'Name is required' })
    }

    // 5. Update User in DB (Bypass RLS)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    })

    const updateData: any = { nome }
    if (fotos !== undefined) updateData.fotos = fotos

    const { error: updateError } = await supabaseAdmin
        .from('users')
        .update(updateData)
        .eq('user_id', user.id)

    if (updateError) {
        throw createError({ statusCode: 500, statusMessage: 'Error updating profile' })
    }

    // 6. Update Auth Metadata (Optional/Best Effort)
    await supabase.auth.updateUser({
        data: {
            name: nome,
            avatar_url: fotos
        }
    })

    return { success: true }
})
