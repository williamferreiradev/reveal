<script setup lang="ts">
import Sidebar from '~/components/Sidebar.vue'

const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

onMounted(async () => {
  if (user.value) {
    try {
      const { data, error } = await client
        .from('users')
        .select('temacessoadm')
        .eq('user_id', user.value.id)
        .single()

      if (error || !data || !data.temacessoadm) {
        console.warn('Persistent check failed: Access revoked.')
        await client.auth.signOut()
        router.push('/login')
      }
    } catch (e) {
      console.error('Security check error:', e)
    }
  }
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-background font-sans antialiased text-gray-900 dark:text-white transition-colors duration-300">
    <!-- Sidebar Component -->
    <Sidebar />

    <!-- Main Content Area -->
    <main class="ml-64 min-h-screen p-8">
      <slot />
    </main>
  </div>
</template>

<style>
/* Remove hardcoded body background to allow Tailwind classes to control it */
/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}
::-webkit-scrollbar-track {
  background: transparent; 
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1; /* gray-300 */
  border-radius: 4px;
}
.dark ::-webkit-scrollbar-thumb {
  background: #2C2C2C; 
}
::-webkit-scrollbar-thumb:hover {
  background: #FF6F00; 
}
</style>
