// https://nuxt.com/docs/api/configuration/nuxt-config
// Trigger restart
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase'],
  supabase: {
    redirect: false
  },
  runtimeConfig: {
    // Private keys (server-side only)
    supabase: {
      serviceKey: process.env.SUPABASE_SERVICE_KEY
    },
    // Public keys (exposed to client)
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY
    }
  }
})