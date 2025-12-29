<script setup lang="ts">
import { 
    Users, 
    Mail, 
    Shield, 
    Edit, 
    LogOut 
} from 'lucide-vue-next'

definePageMeta({
  title: 'Meu Perfil',
  layout: 'default'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const profile = ref<any>(null)
const isLoading = ref(true)

const fetchProfile = async () => {
    isLoading.value = true
    try {
        if (user.value && user.value.id) {
            const { data: { session } } = await client.auth.getSession()
            const token = session?.access_token

            if (token) {
                const data: any = await $fetch('/api/profile', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                
                if (data) {
                    let avatar = data.fotos
                    try {
                        if (avatar && avatar.startsWith('[')) {
                            avatar = JSON.parse(avatar)[0]
                        }
                    } catch (e) {}

                    profile.value = {
                        ...data,
                        avatar: avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.nome)}&background=random`,
                    }
                }
            }
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchProfile()
})

const handleLogout = async () => {
    await client.auth.signOut()
    router.push('/login')
}
</script>

<template>
  <div class="max-w-3xl">
     <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas informações de acesso.</p>
    </header>

    <div v-if="isLoading" class="p-8 text-center text-gray-500">
        Carregando informações...
    </div>

    <div v-else-if="profile" class="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm dark:shadow-none transition-colors">
        
        <!-- Avatar -->
        <div class="relative group">
            <div class="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden border-4 border-gray-100 dark:border-surface-lighter shadow-lg">
                 <img :src="profile.avatar" class="w-full h-full object-cover" />
            </div>
            <div class="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full border-4 border-white dark:border-surface shadow-md">
                <Shield :size="16" />
            </div>
        </div>

        <div class="flex-1 w-full space-y-5">
            <!-- Name -->
            <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                    <Users :size="14" /> Nome
                </label>
                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ profile.nome }}</div>
            </div>

            <!-- Email -->
             <div>
                <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-2">
                    <Mail :size="14" /> Email
                </label>
                <div class="text-lg text-gray-700 dark:text-gray-300 font-medium">{{ user?.email || profile.email }}</div>
            </div>

            <!-- Role -->
            <div>
                 <label class="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center gap-2">
                    <Shield :size="14" /> Função
                </label>
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary text-sm font-bold rounded-lg border border-primary/20">
                    <Shield :size="14" />
                    {{ profile.temacessoadm ? 'Administrador do Sistema' : 'Usuário Padrão' }}
                </span>
            </div>
            
            <!-- Actions -->
            <div class="pt-6 flex gap-3 border-t border-gray-100 dark:border-gray-800 mt-2">
                <button class="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-medium hover:opacity-90 transition-opacity">
                    <Edit :size="16" /> Editar Perfil
                </button>
                <button @click="handleLogout" class="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 rounded-xl font-medium hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors">
                    <LogOut :size="16" /> Sair
                </button>
            </div>
        </div>
    </div>
  </div>
</template>
