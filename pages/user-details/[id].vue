<script setup lang="ts">
import { 
    Users, 
    Image as ImageIcon, // Alias to avoid conflict
    MapPin,
    Calendar,
    Link as LinkIcon,
    ArrowLeft,
    AlertTriangle,
    CheckCircle,
    Ban,
    Megaphone
} from 'lucide-vue-next'
import { toast } from 'vue-sonner'

const route = useRoute()
const router = useRouter()
const { getUserDetails } = useDashboardData()

const userId = route.params.id as string
const user = ref<any>(null)
const posts = ref<any[]>([])
const isLoading = ref(true)
const activeTab = ref('showcase')
const showConfirmModal = ref(false)
const isTogglingPermission = ref(false)

const fetchUser = async () => {
    isLoading.value = true
    try {
        const data = await getUserDetails(userId)
        if (data) {
            user.value = data.user
            posts.value = data.posts
        }
    } finally {
        isLoading.value = false
    }
}

onMounted(() => {
    fetchUser()
})

const goBack = () => router.push('/users')

// Formatting
const formatDate = (date: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

// Ad Permission Toggle
const toggleAdPermission = async () => {
    if (!user.value) return

    // If blocking, show confirmation modal
    if (user.value.podeanunciar === true) {
        showConfirmModal.value = true
        return
    }

    // If enabling, proceed directly
    await executeToggle()
}

const executeToggle = async () => {
    if (!user.value) return

    isTogglingPermission.value = true
    const newStatus = !user.value.podeanunciar

    try {
        const result = await $fetch('/api/admin/toggle-ad-permission', {
            method: 'POST',
            body: {
                userId: user.value.user_id,
                newStatus
            }
        })

        // Update local user data
        user.value.podeanunciar = newStatus
        
        toast.success(result.message || 'Permissão atualizada com sucesso!')
        showConfirmModal.value = false

    } catch (error: any) {
        console.error('Error toggling ad permission:', error)
        toast.error(error.data?.statusMessage || 'Erro ao atualizar permissão')
    } finally {
        isTogglingPermission.value = false
    }
}
</script>

<template>
    <div v-if="isLoading" class="flex justify-center items-center h-screen">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="!user" class="flex flex-col items-center justify-center h-96 text-gray-500">
        <Users :size="48" class="mb-4 text-gray-400" />
        <p class="text-xl">Usuário não encontrado</p>
        <button @click="goBack" class="mt-4 text-primary hover:underline">Voltar para Usuários</button>
    </div>

    <div v-else class="min-h-screen bg-gray-50 dark:bg-background">
        <!-- Orange Banner -->
        <div class="h-60 bg-gradient-to-r from-orange-400 to-orange-600 w-full relative rounded-b-3xl shadow-md z-0">
            <button @click="goBack" class="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition">
                <ArrowLeft :size="24" />
            </button>
        </div>

        <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <div class="flex flex-col lg:flex-row gap-8 -mt-20">
                
                <!-- Profile Card (Left) -->
                <div class="w-full lg:w-80 flex-shrink-0">
                    <div class="bg-white dark:bg-surface rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800">
                        <!-- Avatar -->
                        <div class="flex justify-center -mt-16 mb-4 relative z-20">
                            <div class="p-1.5 bg-white dark:bg-surface rounded-full">
                                <img 
                                    :src="user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.nome)}&background=random`" 
                                    alt="Avatar" 
                                    class="w-32 h-32 rounded-full object-cover border-4 border-white dark:border-surface shadow-md"
                                />
                            </div>
                        </div>

                        <!-- Info -->
                        <div class="text-center mb-6">
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ user.nome }}</h1>
                            <p class="text-gray-500 dark:text-gray-400 text-sm">@{{ user.nome.toLowerCase().replace(/\s+/g, '') }}</p>
                        </div>

                        <div class="text-center mb-6">
                            <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                                {{ user.bio || 'Sem biografia.' }}
                            </p>
                        </div>

                        <!-- Stats Row -->
                        <div class="flex justify-between items-center text-center border-t border-b border-gray-100 dark:border-gray-800 py-4 mb-6">
                            <div class="flex-1">
                                <div class="font-bold text-gray-900 dark:text-white text-lg">{{ user.matchesCount || 0 }}</div>
                                <div class="text-xs text-gray-500 uppercase tracking-wide">Matches</div>
                            </div>
                            <div class="flex-1 border-l border-gray-100 dark:border-gray-800">
                                <div class="font-bold text-gray-900 dark:text-white text-lg">{{ posts.length }}</div>
                                <div class="text-xs text-gray-500 uppercase tracking-wide">Posts</div>
                            </div>
                        </div>

                        <!-- Details List -->
                        <div class="space-y-3 mb-6">
                            <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <Calendar :size="16" />
                                <span>Entrou em {{ formatDate(user.created_at) }}</span>
                            </div>
                             <div class="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                <MapPin :size="16" />
                                <span>{{ user.lat ? 'Localização Ativa' : 'Localização Oculta' }}</span>
                            </div>
                        </div>

                         <!-- Ad Permission Toggle Button -->
                         <button 
                            @click="toggleAdPermission"
                            :disabled="isTogglingPermission"
                            class="w-full font-medium py-2.5 rounded-lg transition-colors shadow-lg flex items-center justify-center gap-2"
                            :class="user.podeanunciar 
                                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20' 
                                : 'bg-green-500 hover:bg-green-600 text-white shadow-green-500/20'
                            "
                         >
                            <Megaphone v-if="!user.podeanunciar" :size="18" />
                            <Ban v-else :size="18" />
                            <span v-if="!isTogglingPermission">
                                {{ user.podeanunciar ? 'Bloquear anúncios' : 'Liberar para anunciar' }}
                            </span>
                            <span v-else>Processando...</span>
                         </button>
                    </div>
                </div>

                <!-- Main Content (Right) -->
                <div class="flex-1 pt-4 lg:pt-20">
                    <!-- Heading -->
                    <div class="border-b border-gray-200 dark:border-gray-800 mb-8 pb-3">
                        <h2 class="text-lg font-medium text-primary">Posts Criados</h2>
                    </div>

                    <!-- Grid -->
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div v-for="post in posts" :key="post.id" class="group relative aspect-square bg-gray-100 dark:bg-surface rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all">
                            
                            <!-- Image/Video -->
                            <img 
                                v-if="post.midia_url && (post.tipo === 'post' || post.tipo === 'image')" 
                                :src="post.midia_url" 
                                class="w-full h-full object-cover"
                            />
                            <div v-else-if="post.tipo === 'video' && post.midia_url" class="w-full h-full bg-black relative z-10">
                                <video 
                                    :src="post.midia_url" 
                                    class="w-full h-full object-cover"
                                    controls
                                    preload="metadata"
                                ></video>
                            </div>
                            <div v-else class="w-full h-full p-4 flex items-center justify-center text-center text-gray-500 text-sm">
                                {{ post.conteudo || 'Sem conteúdo visual' }}
                            </div>

                            <!-- Overlay (Only for images, or non-intrusive for videos) -->
                            <!-- Moving stats to bottom bar to not obstruct view -->
                            <div v-if="post.tipo !== 'video'" class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white z-20 pointer-events-none">
                                <div class="flex items-center gap-1">
                                    <Heart :size="16" fill="white" />
                                    <span class="text-sm font-bold">{{ post.curtidas_count || 0 }}</span>
                                </div>
                            </div>
                        </div>

                         <div v-if="posts.length === 0" class="col-span-full py-12 text-center text-gray-500">
                            Nenhum post encontrado para este usuário.
                        </div>
                    </div>

                </div>
            </div>
        </div>
    </div>

    <!-- Confirmation Modal -->
    <Transition
        enter-active-class="transition ease-out duration-150"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div v-if="showConfirmModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white dark:bg-surface rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-800 transform transition-all scale-100">
                <div class="p-6 text-center">
                    <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
                        <AlertTriangle :size="32" />
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Bloquear anúncios?</h3>
                    <p class="text-gray-600 dark:text-gray-400 mb-6">
                        Tem certeza que deseja bloquear <strong>{{ user?.nome }}</strong> de anunciar? 
                        <span class="block mt-2 text-red-600 dark:text-red-400 font-semibold">Todos os anúncios deste usuário serão permanentemente removidos.</span>
                    </p>
                    
                    <div class="flex gap-3 justify-center">
                        <button 
                            @click="showConfirmModal = false"
                            :disabled="isTogglingPermission"
                            class="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
                        >
                            Cancelar
                        </button>
                        <button 
                            @click="executeToggle"
                            :disabled="isTogglingPermission"
                            class="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
                        >
                            <Ban :size="18" />
                            {{ isTogglingPermission ? 'Bloqueando...' : 'Confirmar' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>
</template>
