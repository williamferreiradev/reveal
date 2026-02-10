import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    try {
        // 1. Parse Request Body
        const body = await readBody(event)
        const { nome, email, mensagem } = body

        // Validate inputs
        if (!nome || !email || !mensagem) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Todos os campos são obrigatórios.'
            })
        }

        // 2. Setup Supabase Clients
        const config = useRuntimeConfig()
        const supabaseUrl = process.env.SUPABASE_URL || config.public?.supabaseUrl
        const supabaseAnonKey = process.env.SUPABASE_KEY || config.public?.supabaseKey
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || config.supabase?.serviceKey

        if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro de configuração do servidor.'
            })
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // 3. Verify email exists in users table (which should match auth.users)
        const { data: userRecord, error: userCheckError } = await supabaseAdmin
            .from('users')
            .select('email')
            .eq('email', email)
            .single()

        if (userCheckError || !userRecord) {
            throw createError({
                statusCode: 403,
                statusMessage: 'E-mail não cadastrado no sistema. Apenas usuários registrados podem enviar mensagens de suporte.'
            })
        }

        // 4. Check rate limit (2 messages per day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const { data: todayMessages, error: countError } = await supabaseAdmin
            .from('suporte')
            .select('id')
            .eq('email', email)
            .gte('created_at', today.toISOString())
            .lt('created_at', tomorrow.toISOString())

        if (countError) {
            console.error('Count error:', countError)
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro ao verificar limite de mensagens.'
            })
        }

        if (todayMessages && todayMessages.length >= 2) {
            throw createError({
                statusCode: 429,
                statusMessage: 'Limite de mensagens atingido. Você pode enviar no máximo 2 mensagens por dia.'
            })
        }

        // 5. Insert support message
        const { data, error: insertError } = await supabaseAdmin
            .from('suporte')
            .insert({
                nome,
                email,
                texto: mensagem,
                lido: false
            })
            .select()
            .single()

        if (insertError) {
            console.error('Insert error:', insertError)
            throw createError({
                statusCode: 500,
                statusMessage: 'Erro ao salvar mensagem de suporte.'
            })
        }

        return {
            success: true,
            message: 'Mensagem enviada com sucesso!',
            data
        }

    } catch (error: any) {
        // If it's already a createError, rethrow it
        if (error.statusCode) {
            throw error
        }

        // Otherwise, return generic error
        console.error('Unexpected error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Erro inesperado ao processar sua solicitação.'
        })
    }
})
