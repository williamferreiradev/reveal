import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
    try {
        // 1. Read request body
        const body = await readBody(event)
        const { userId, newStatus } = body

        if (!userId || typeof newStatus !== 'boolean') {
            throw createError({
                statusCode: 400,
                statusMessage: 'Missing userId or newStatus in request body'
            })
        }

        console.log(`📝 Received userId: ${userId} (type: ${typeof userId})`)
        console.log(`📝 Received newStatus: ${newStatus}`)

        // 2. Setup Supabase Admin Client
        const config = useRuntimeConfig()
        const supabaseUrl = process.env.SUPABASE_URL || config.public?.supabaseUrl
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || config.supabase?.serviceKey

        if (!supabaseUrl || !supabaseServiceKey) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Server configuration error'
            })
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        })

        // 3. Update user's podeanunciar field
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update({ podeanunciar: newStatus })
            .eq('user_id', userId)
            .select()
            .single()

        if (updateError) {
            console.error('Error updating user:', updateError)
            throw createError({
                statusCode: 500,
                statusMessage: `Failed to update user: ${updateError.message}`
            })
        }

        // 4. If blocking (newStatus = false), delete all user's ads
        let deletedCount = 0
        if (newStatus === false) {
            console.log(`🗑️ Attempting to delete ads for user_id: ${userId}`)

            // First, check how many ads exist (this works because SELECT is allowed)
            const { count: adsCount, error: countError } = await supabase
                .from('anuncios')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)

            if (countError) {
                console.error('❌ Error counting ads:', countError)
            } else {
                console.log(`📊 Found ${adsCount || 0} ads for user ${userId}`)
            }

            // Use PostgreSQL function to delete (bypasses RLS)
            // This function needs to be created in Supabase SQL Editor
            const { data: rpcResult, error: rpcError } = await supabase
                .rpc('admin_delete_user_ads', { target_user_id: userId })

            if (rpcError) {
                // If function doesn't exist, create it via raw query
                console.log('⚠️ RPC function not found, attempting direct SQL delete...')

                // Try using the REST API directly with service key
                const deleteUrl = `${supabaseUrl}/rest/v1/anuncios?user_id=eq.${userId}`

                try {
                    const response = await fetch(deleteUrl, {
                        method: 'DELETE',
                        headers: {
                            'apikey': supabaseServiceKey,
                            'Authorization': `Bearer ${supabaseServiceKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=representation'
                        }
                    })

                    console.log(`🌐 REST API Response Status: ${response.status}`)
                    const responseText = await response.text()
                    console.log(`🌐 REST API Response Body: ${responseText}`)

                    if (!response.ok) {
                        console.error('❌ REST API delete failed:', responseText)
                        throw new Error(`REST delete failed: ${response.status} - ${responseText}`)
                    }

                    const deletedAds = responseText ? JSON.parse(responseText) : []
                    deletedCount = Array.isArray(deletedAds) ? deletedAds.length : 0
                    console.log(`✅ Successfully deleted ${deletedCount} ads via REST API`)
                    console.log(`📋 Deleted ads:`, deletedAds)

                } catch (fetchError: any) {
                    console.error('❌ Error with REST API delete:', fetchError)
                    throw createError({
                        statusCode: 500,
                        statusMessage: `Failed to delete ads: ${fetchError.message}`
                    })
                }
            } else {
                deletedCount = rpcResult || 0
                console.log(`✅ Successfully deleted ${deletedCount} ads via RPC`)
            }
        }

        return {
            success: true,
            user: updatedUser,
            deletedAdsCount: deletedCount,
            message: newStatus
                ? 'Usuário liberado para anunciar'
                : `Usuário bloqueado. ${deletedCount} anúncio(s) removido(s).`
        }

    } catch (error: any) {
        console.error('Toggle ad permission error:', error)
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal server error'
        })
    }
})
