<script setup lang="ts">
import { 
    Users, 
    Mail, 
    Shield, 
    Edit, 
    LogOut,
    Check,
    X,
    Lock,
    Key
} from 'lucide-vue-next'

definePageMeta({
  title: 'Meu Perfil',
  layout: 'default'
})

const client = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const isLoading = ref(true)
const isSaving = ref(false)
const isEditing = ref(false)
const showPasswordModal = ref(false)

const profile = ref<any>(null)
const editForm = ref({
    nome: '',
    avatar: ''
})

const resetPasswordEmail = ref('')
const isSendingReset = ref(false)

const loadProfile = async () => {
    console.log('Loading profile...', { user: !!user.value })
    // Only set loading true if we don't have data yet
    if (!profile.value) isLoading.value = true

    // 1. Immediate Auth Fallback
    if (user.value) {
        const authName = user.value.user_metadata?.name || user.value.email?.split('@')[0] || 'Usuário'
        // Only overwrite if we don't have profile data or if it's the first load
        if (!profile.value) {
            profile.value = {
                nome: authName,
                email: user.value.email,
                avatar: user.value.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authName)}&background=0D8ABC&color=fff`,
                temacessoadm: false
            }
        }
    } else {
        // If no user after a short delay, redirect
        setTimeout(() => {
            if (!user.value) {
                console.warn('No user found, redirecting to login')
                router.push('/login')
            }
        }, 1000)
    }

    if (!user.value || !user.value.id) {
        // If we have profile data (fallback), stop loading. 
        // If not, we are waiting for redirect, but stop spinner anyway to show empty state if needed.
        isLoading.value = false
        return
    }

    try {
        const { data: { session } } = await client.auth.getSession()
        const token = session?.access_token

        if (token) {
            const data: any = await $fetch('/api/profile', {
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (data) {
                let avatar = data.fotos
                try {
                    if (avatar && avatar.startsWith('[')) {
                        avatar = JSON.parse(avatar)[0]
                    }
                } catch (e) {}

                const finalName = data.nome || profile.value.nome
                profile.value = {
                    ...data,
                    nome: finalName,
                    email: user.value.email,
                    avatar: avatar || user.value.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(finalName)}&background=0D8ABC&color=fff`,
                }
            }
        }
    } catch (error) {
        console.error('Error fetching full profile:', error)
    } finally {
        isLoading.value = false
    }
}

const startEditing = () => {
    editForm.value.nome = profile.value?.nome || ''
    editForm.value.avatar = profile.value?.avatar || ''
    isEditing.value = true
}

const cancelEditing = () => {
    isEditing.value = false
}

const saveProfile = async () => {
    if (!editForm.value.nome.trim()) return
    
    isSaving.value = true
    try {
        const { data: { session } } = await client.auth.getSession()
        const token = session?.access_token
        
        if (token) {
            // We need to update the API to accept avatar/fotos if we want to save it
            // For now, let's assume the API handles it or we only update name.
            // Wait, the API I wrote earlier ONLY updates name. I should update that too.
            // But let's first send it.
            
             // Note: User asked for "forto" (photo). I will update the PUT endpoint next.
            await $fetch('/api/profile', {
                method: 'PUT',
                body: { 
                    nome: editForm.value.nome,
                    fotos: editForm.value.avatar 
                },
                headers: { Authorization: `Bearer ${token}` }
            })
            
            if (profile.value) {
                profile.value.nome = editForm.value.nome
                profile.value.avatar = editForm.value.avatar
            }
            isEditing.value = false
        }
    } catch (e) {
        console.error('Error saving:', e)
        alert('Erro ao salvar. Tente novamente.')
    } finally {
        isSaving.value = false
    }
}

const sendPasswordReset = async () => {
    if (!user.value?.email) return
    isSendingReset.value = true
    try {
        const { error } = await client.auth.resetPasswordForEmail(user.value.email, {
            redirectTo: window.location.origin + '/update-password',
        })
        if (error) throw error
        alert(`Email de redefinição enviado para ${user.value.email}`)
    } catch (e: any) {
        alert('Erro ao enviar email: ' + e.message)
    } finally {
        isSendingReset.value = false
    }
}

watch(user, (newUser) => {
    if (newUser && newUser.id) {
        loadProfile()
    }
}, { immediate: true })

const handleLogout = async () => {
    await client.auth.signOut()
    router.push('/login')
}
</script>

<template>
  <div class="max-w-4xl mx-auto py-8">
     <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Meu Perfil</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Gerencie suas informações pessoais e segurança.</p>
    </header>

    <div v-if="isLoading && !profile" class="p-12 text-center">
        <div class="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
        <p class="text-gray-500">Carregando informações...</p>
    </div>

    <div v-else-if="profile" class="grid gap-8">
        <!-- Main Profile Card -->
        <div class="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <div class="flex flex-col md:flex-row gap-8 items-start">
                
                <!-- Avatar Section -->
                <div class="flex-shrink-0 relative group mx-auto md:mx-0">
                    <div class="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-700 overflow-hidden border-4 border-white dark:border-gray-800 shadow-xl">
                        <img :src="profile.avatar" class="w-full h-full object-cover" />
                    </div>
                </div>

                <!-- Details Section -->
                <div class="flex-grow w-full space-y-6">
                    <!-- Header with Name/Role -->
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-6">
                        <div>
                            <div v-if="!isEditing">
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    {{ profile.nome }}
                                </h2>
                                <p class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ profile.email }}</p>
                            </div>
                            <div v-else class="w-full max-w-md space-y-3">
                                <div>
                                    <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Nome Completo</label>
                                    <input 
                                        v-model="editForm.nome"
                                        type="text"
                                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                                        placeholder="Seu nome"
                                    />
                                </div>
                                <div>
                                     <label class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">URL da Foto (Avatar)</label>
                                     <input 
                                        v-model="editForm.avatar"
                                        type="text"
                                        class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
                                        placeholder="https://..."
                                        @keyup.enter="saveProfile"
                                    />
                                </div>
                            </div>
                        </div>

                        <span class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-full border border-blue-100 dark:border-blue-800">
                             <Shield :size="12" />
                             {{ profile.temacessoadm ? 'Administrador' : 'Usuário' }}
                        </span>
                    </div>

                    <!-- Actions -->
                    <div class="flex flex-wrap gap-3">
                        <template v-if="!isEditing">
                            <button 
                                @click="startEditing"
                                class="flex items-center gap-2 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 transition-all shadow-lg shadow-gray-200 dark:shadow-none"
                            >
                                <Edit :size="16" /> Editar Perfil
                            </button>
                            
                            <button 
                                @click="handleLogout"
                                class="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg font-medium transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-800"
                            >
                                <LogOut :size="16" /> Sair
                            </button>
                        </template>

                        <template v-else>
                             <button 
                                @click="saveProfile" 
                                :disabled="isSaving"
                                class="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary-dark transition-all disabled:opacity-70 shadow-lg shadow-primary/30"
                            >
                                <Check :size="18" /> {{ isSaving ? 'Salvando...' : 'Salvar' }}
                            </button>
                            <button 
                                @click="cancelEditing"
                                :disabled="isSaving"
                                class="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                                <X :size="18" /> Cancelar
                            </button>
                        </template>
                    </div>
                </div>
            </div>
        </div>

        <!-- Security Section -->
        <div class="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <Lock :size="20" class="text-gray-400" /> Segurança
            </h3>
            
            <div class="space-y-6">
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800">
                    <div>
                        <p class="font-medium text-gray-900 dark:text-white">Senha</p>
                        <p class="text-sm text-gray-500">Recomendamos alterar sua senha periodicamente.</p>
                    </div>
                     <button 
                        @click="sendPasswordReset"
                        :disabled="isSendingReset"
                        class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-surface border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        {{ isSendingReset ? 'Enviando...' : 'Redefinir Senha' }}
                    </button>
                </div>
                
                <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 opacity-70 cursor-not-allowed">
                    <div>
                        <p class="font-medium text-gray-900 dark:text-white">Email</p>
                        <p class="text-sm text-gray-500">{{ profile.email }}</p>
                    </div>
                    <button disabled class="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg border border-transparent">
                        Alterar
                    </button>
                </div>
                <p class="text-xs text-gray-400 mt-2">* Para alterar seu e-mail, entre em contato com o suporte.</p>
            </div>
        </div>
    </div>
  </div>
</template>
