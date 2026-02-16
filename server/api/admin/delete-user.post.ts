
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { userId, userTableId } = body // userId is UUID, userTableId is ID in 'users'

    if (!userId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'User UUID is required'
        })
    }

    const config = useRuntimeConfig() as any
    const supabaseUrl = process.env.SUPABASE_URL || config.public?.supabase?.url
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || config.supabase?.serviceKey

    if (!supabaseServiceKey) {
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error: Missing Service Key'
        })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })

    const results = {
        matches: 'skipped',
        messages: 'skipped',
        likes: 'skipped',
        posts: 'skipped',
        stories: 'skipped',
        users_table: 'skipped',
        auth: 'skipped'
    }

    try {
        console.log(`[DELETE USER] Starting deletion for ${userId}...`)

        // 1. Apagar Matches (quem_deu_match OR quem_recebeu_match)
        // Matches usually link two users.
        try {
            const { error } = await supabase
                .from('matches')
                .delete()
                .or(`quem_deu_match.eq.${userId},quem_recebeu_match.eq.${userId}`)

            if (error) throw error
            results.matches = 'success'
        } catch (e: any) {
            console.error('Error deleting matches:', e.message)
            results.matches = `error: ${e.message}`
        }

        // 2. Apagar Mensagens (Best Effort - Table might be 'messages' or 'chat_messages')
        // Assuming 'messages' with 'sender_id'
        try {
            const { error } = await supabase
                .from('messages')
                .delete()
                .eq('sender_id', userId)

            if (error && error.code !== '42P01') { // Ignore table not found
                throw error
            }
            results.messages = 'success'
        } catch (e: any) {
            console.error('Error deleting messages:', e.message)
            results.messages = `error: ${e.message}`
        }

        // 3. Apagar Likes (quem_deu_like)
        try {
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('quem_deu_like', userId) // inferred column

            if (error) throw error
            results.likes = 'success'
        } catch (e: any) {
            console.error('Error deleting likes:', e.message)
            results.likes = `error: ${e.message}`
        }

        // 4. Apagar Posts (feed_posts)
        try {
            const { error } = await supabase
                .from('feed_posts')
                .delete()
                .eq('user_id', userId)

            if (error) throw error
            results.posts = 'success'
        } catch (e: any) {
            console.error('Error deleting posts:', e.message)
            results.posts = `error: ${e.message}`
        }

        // 5. Apagar Stories (stories table? or feed_posts type story?)
        // Trying 'stories' table first
        try {
            const { error } = await supabase
                .from('stories')
                .delete()
                .eq('user_id', userId)

            if (error && error.code !== '42P01') throw error
            results.stories = 'success'
        } catch (e: any) {
            // If table doesn't exist, maybe it's fine.
            console.error('Error deleting stories:', e.message)
            results.stories = `error: ${e.message}`
        }

        // 6. Apagar Usuário da Tabela 'users'
        // Using 'user_id' (UUID) to be safe, though users table has 'id' too.
        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('user_id', userId)

            if (error) throw error
            results.users_table = 'success'
        } catch (e: any) {
            console.error('Error deleting public user profile:', e.message)
            results.users_table = `error: ${e.message}`
        }

        // 7. Apagar da Autenticação (Supabase Auth) - FINAL STEP
        try {
            const { error } = await supabase.auth.admin.deleteUser(userId)
            if (error) throw error
            results.auth = 'success'
        } catch (e: any) {
            console.error('Error deleting auth user:', e.message)
            results.auth = `error: ${e.message}`
            // If auth deletion fails, we still return success structure but with error note
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to delete auth user: ${e.message}`
            })
        }

        return {
            success: true,
            details: results
        }

    } catch (e: any) {
        console.error('Critical error in delete-user endpoint:', e)
        return {
            success: false,
            error: e.message,
            partialResults: results
        }
    }
})
