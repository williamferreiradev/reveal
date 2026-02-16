import { createClient } from '@supabase/supabase-js'

export const useSupabase = () => {
    const config = useRuntimeConfig()

    // Use public config exposed in nuxt.config.ts
    const supabaseUrl = config.public.supabaseUrl as string
    const supabaseKey = config.public.supabaseKey as string

    if (!supabaseUrl || !supabaseKey) {
        console.warn('Supabase credentials missing in runtime config')
    }

    // Create client (singleton pattern could be applied here if needed, but simple init is fine for now)
    const client = createClient(supabaseUrl, supabaseKey)

    return client
}
