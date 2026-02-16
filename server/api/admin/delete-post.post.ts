
import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    const { postId } = body

    if (!postId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Post ID is required'
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
        comments: 'skipped',
        likes: 'skipped',
        post: 'skipped'
    }

    try {
        console.log(`[DELETE POST] Starting deletion for Post ID ${postId}...`)

        // 1. Apagar Comentários (feed_comments)
        try {
            // Assuming foreign key is 'post_id'
            const { error } = await supabase
                .from('feed_comments')
                .delete()
                .eq('post_id', postId)

            if (error) {
                // If error is strictly about column not found, we might try alternative keys like 'feed_post_id'?
                // But for now, just throw/log.
                if (error.code === '42703') { // Undefined column
                    console.warn('Column post_id not found in feed_comments, trying id_post...')
                    const { error: retryError } = await supabase
                        .from('feed_comments')
                        .delete()
                        .eq('id_post', postId)
                    if (retryError) throw retryError
                } else {
                    throw error
                }
            }
            results.comments = 'success'
        } catch (e: any) {
            console.error('Error deleting comments:', e.message)
            results.comments = `error: ${e.message}`
        }

        // 2. Apagar Curtidas (feed_curtidas)
        try {
            const { error } = await supabase
                .from('feed_curtidas')
                .delete()
                .eq('post_id', postId)

            if (error) {
                if (error.code === '42703') {
                    const { error: retryError } = await supabase
                        .from('feed_curtidas')
                        .delete()
                        .eq('id_post', postId)
                    if (retryError) throw retryError
                } else {
                    throw error
                }
            }
            results.likes = 'success'
        } catch (e: any) {
            console.error('Error deleting likes:', e.message)
            results.likes = `error: ${e.message}`
        }

        // 3. Apagar o Post (feed_posts)
        try {
            const { error } = await supabase
                .from('feed_posts')
                .delete()
                .eq('id', postId)

            if (error) throw error
            results.post = 'success'
        } catch (e: any) {
            console.error('Error deleting post:', e.message)
            results.post = `error: ${e.message}`
            throw e // Critical failure if post not deleted
        }

        return {
            success: true,
            details: results
        }

    } catch (e: any) {
        console.error('Critical error in delete-post endpoint:', e)
        return {
            success: false,
            error: e.message,
            partialResults: results
        }
    }
})
