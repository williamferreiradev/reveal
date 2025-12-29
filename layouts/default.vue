<script setup lang="ts">
import Sidebar from '~/components/Sidebar.vue'

const user = useSupabaseUser()
const client = useSupabaseClient()
const router = useRouter()

onMounted(async () => {
  if (user.value && user.value.id) {
    try {
      // Use our robust server API instead of direct DB query (avoids RLS/Undefined issues)
      const { data: { session } } = await client.auth.getSession()
      const token = session?.access_token
      
      if (token) {
           const { isAdmin } = await $fetch('/api/verify-access', {
                headers: { Authorization: `Bearer ${token}` }
           })

           if (!isAdmin) {
                console.warn('Persistent check failed: Access revoked.')
                await client.auth.signOut()
                router.push('/login')
           }
      }
    } catch (e) {
      console.error('Security check error:', e)
      // Optional: Redirect on error? Or just log? 
      // Safe to ignore transient network errors to avoid locking user out unnecessarily
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
