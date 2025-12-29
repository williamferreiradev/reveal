<script setup lang="ts">
import { 
  Home, 
  Users, 
  FileText, 
  BarChart2, 
  AlertTriangle, 
  LogOut, 
  User,
  Sun,
  Moon,
  Search
} from 'lucide-vue-next'

const route = useRoute()
const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()
const { isDark, toggleTheme, initTheme } = useTheme()

const userProfile = ref<any>({
    name: 'Admin User',
    avatar: '',
    role: 'Carregando...'
})

onMounted(async () => {
    initTheme()
    
    // Fetch Profile
    if (user.value) {
        const { data } = await client
            .from('users')
            .select('nome, fotos, temacessoadm')
            .eq('user_id', user.value.id)
            .single()
            
        if (data) {
            let avatar = data.fotos
            try {
                if (avatar && avatar.startsWith('[')) {
                    avatar = JSON.parse(avatar)[0]
                }
            } catch (e) {}
            
            userProfile.value = {
                name: data.nome || 'Admin',
                avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nome || 'A')}&background=random`,
                role: data.temacessoadm ? 'Administrador' : 'Usuário'
            }
        }
    }
})

const handleLogout = async () => {
    await client.auth.signOut()
    router.push('/login')
}

const menuItems = [
  { name: 'Home', path: '/', icon: Home },
  { name: 'Usuários', path: '/users', icon: Users },
  { name: 'Posts', path: '/posts', icon: FileText },
  { name: 'Analytics', path: '/analytics', icon: BarChart2 },
  { name: 'Análise', path: '/analysis', icon: Search },
  { name: 'Denúncias', path: '/reports', icon: AlertTriangle, badge: 'Em breve' },
]

const isActive = (path: string) => route.path === path

// Initialize Theme
onMounted(() => {
  initTheme()
})
</script>

<template>
  <aside class="w-64 h-screen bg-white dark:bg-surface border-r border-gray-200 dark:border-gray-800 flex flex-col fixed left-0 top-0 transition-colors duration-300 z-50">
    <!-- Logo -->
    <div class="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span class="text-white font-bold text-lg">R</span>
        </div>
        <span class="text-xl font-bold text-gray-900 dark:text-white tracking-wide transition-colors">Reveal</span>
      </div>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto py-6 px-4 space-y-2">
      <NuxtLink 
        v-for="item in menuItems" 
        :key="item.path"
        :to="item.path"
        class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative"
        :class="isActive(item.path) ? 'bg-primary/10 text-primary' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-surface-lighter'"
      >
        <component :is="item.icon" :size="20" />
        <span class="font-medium">{{ item.name }}</span>
        
        <!-- Badge -->
        <span v-if="item.badge" class="absolute right-2 text-[10px] font-bold px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700">
            {{ item.badge }}
        </span>
      </NuxtLink>
    </nav>

    <!-- Footer: Theme Toggle & User Profile -->
    <div class="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-surface-lighter/30 transition-colors duration-300 space-y-3">
        
        <!-- Theme Toggle Button -->
        <button 
          @click="toggleTheme" 
          class="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface hover:bg-gray-50 dark:hover:bg-surface-lighter text-gray-600 dark:text-gray-300 transition-all shadow-sm"
        >
          <div class="flex items-center gap-2 text-sm font-medium">
             <component :is="isDark ? Moon : Sun" :size="16" />
             <span>{{ isDark ? 'Modo Escuro' : 'Modo Claro' }}</span>
          </div>
          <!-- Toggle Switch UI -->
          <div class="w-8 h-4 bg-gray-200 dark:bg-gray-700 rounded-full relative transition-colors">
             <div 
               class="absolute top-0.5 w-3 h-3 bg-white dark:bg-primary rounded-full shadow-sm transition-all duration-300"
               :class="isDark ? 'left-[18px]' : 'left-0.5'"
             ></div>
          </div>
        </button>

        <NuxtLink to="/profile" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-surface-lighter transition-colors group">
            <div class="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden border-2 border-transparent group-hover:border-primary transition-colors">
                <img :src="userProfile.avatar" alt="User" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 min-w-0">
                <p class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ userProfile.name }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ userProfile.role }}</p>
            </div>
        </NuxtLink>

        <button @click="handleLogout" class="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/20 text-red-500 hover:bg-red-50/50 dark:hover:bg-red-500/10 transition-colors text-sm font-medium">
            <LogOut :size="16" />
            Sair da conta
        </button>
    </div>
  </aside>
</template>
