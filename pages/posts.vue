<script setup lang="ts">
import { 
  Eye, 
  Trash2, 
  Image as ImageIcon,
  Video,
  FileText,
  ThumbsUp,
  MessageCircle,
  Search,
  AlertTriangle,
  CheckCircle
} from 'lucide-vue-next'

definePageMeta({
  title: 'Posts',
  layout: 'default'
})

const router = useRouter()

// UI State (Delete & Toast)
const showDeleteModal = ref(false)
const postToDelete = ref<any>(null)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

const displayToast = (msg: string, type: string = 'success') => {
    toastMessage.value = msg
    toastType.value = type
    showToast.value = true
    setTimeout(() => showToast.value = false, 3000)
}

// Data Fetching
const { getPosts } = useDashboardData()
const posts = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
    try {
        const data = await getPosts()
        
        if (data && data.length > 0) {
            posts.value = data.map(p => ({
                id: p.id,
                user: p.user, 
                conteudo: p.conteudo,
                midia_url: p.midia_url,
                tipo: p.tipo || (p.midia_url ? 'image' : 'text'),
                curtidas_count: p.curtidas_count || 0,
                comentarios_count: p.comentarios_count || 0,
                created_at: p.created_at ? new Date(p.created_at).toLocaleString('pt-BR') : 'Data desc.'
            }))
        }
    } catch (e) {
        console.error('Error loading posts:', e)
    } finally {
        isLoading.value = false
    }
})

const searchQuery = ref('')

const filteredPosts = computed(() => {
    if (!searchQuery.value) return posts.value
    const query = searchQuery.value.toLowerCase()
    return posts.value.filter(post => 
        (post.conteudo && post.conteudo.toLowerCase().includes(query)) || 
        (post.user.name && post.user.name.toLowerCase().includes(query))
    )
})

const getMediaIcon = (type: string) => {
    switch(type) {
        case 'image': return ImageIcon
        case 'video': return Video
        default: return FileText
    }
}

// Modal Actions
const openDeleteModal = (post: any) => {
    postToDelete.value = post
    showDeleteModal.value = true
}

const confirmDelete = async () => {
    if (!postToDelete.value) return

    try {
        displayToast('Apagando post...', 'info')
        
        const response = await $fetch<any>('/api/admin/delete-post', {
            method: 'POST',
            body: { 
                postId: postToDelete.value.id
            }
        })

        if (response.success) {
            posts.value = posts.value.filter(p => p.id !== postToDelete.value.id)
            displayToast('Post deletado com sucesso!', 'success')
            showDeleteModal.value = false
            postToDelete.value = null
        } else {
            throw new Error(response.error || 'Erro ao deletar post')
        }

    } catch (e: any) {
        console.error('Delete error:', e)
        displayToast(`Erro: ${e.message}`, 'error')
    }
}

const handleAction = (action: string, data: any) => {
    if (action === 'Excluir Post') {
        const post = posts.value.find(p => p.id === data)
        if (post) openDeleteModal(post)
    } else if (action === 'Ver Detalhes do Post') {
         alert(`Detalhes do Post ${data}`)
    }
}
</script>

<template>
  <div class="relative">
    <!-- Toast Notification -->
    <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 translate-y-2"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 translate-y-2"
    >
        <div v-if="showToast" class="fixed top-24 right-6 z-50 bg-white dark:bg-surface-light border shadow-lg rounded-lg px-4 py-3 flex items-center gap-3" 
             :class="toastType === 'error' ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'">
            <CheckCircle v-if="toastType === 'success'" :size="20" />
            <AlertTriangle v-else-if="toastType === 'error'" :size="20" />
            <span class="text-sm font-medium">{{ toastMessage }}</span>
        </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
    >
        <div v-if="showDeleteModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div class="bg-white dark:bg-surface rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-gray-800 transform transition-all scale-100">
                <div class="p-6 text-center">
                    <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-500">
                        <AlertTriangle :size="32" />
                    </div>
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Excluir Publicação?</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                        Ao apagar este post, <strong>todos os comentários e curtidas</strong> associados a ele também serão removidos permanentemente.
                    </p>
                    
                    <div class="flex gap-3 justify-center">
                        <button 
                            @click="showDeleteModal = false"
                            class="px-5 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button 
                            @click="confirmDelete"
                            class="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/20 transition-all transform hover:scale-105"
                        >
                            Apagar Tudo
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

    <header class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Posts</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Visualize o feed de publicações dos usuários.</p>
        </div>

        <div class="flex gap-3 w-full md:w-auto">
             <!-- Search Input -->
            <div class="relative w-full md:w-64">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Buscar post ou usuário..." 
                    class="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
            </div>
        </div>
    </header>

    <div class="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm dark:shadow-none mb-8">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-gray-50 dark:bg-surface-lighter border-b border-gray-200 dark:border-gray-800">
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-16">Mídia</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Conteúdo</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Autor</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-center">Interações</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                 <tr v-if="filteredPosts.length === 0">
                    <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Nenhum post encontrado.
                    </td>
                </tr>
                <tr v-for="post in filteredPosts" :key="post.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                    <!-- Media Column -->
                    <td class="px-6 py-4">
                        <div v-if="post.midia_url" class="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative group cursor-pointer">
                            <img :src="post.midia_url" class="w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <component :is="getMediaIcon(post.tipo)" class="text-white w-4 h-4" />
                            </div>
                        </div>
                        <div v-else class="w-12 h-12 rounded-lg bg-gray-100 dark:bg-surface-lighter flex items-center justify-center text-gray-400">
                            <FileText :size="20" />
                        </div>
                    </td>

                    <!-- Content Column -->
                    <td class="px-6 py-4 max-w-xs">
                        <p class="text-sm text-gray-900 dark:text-white truncate" :title="post.conteudo || ''">
                            {{ post.conteudo || 'Sem texto' }}
                        </p>
                        <span class="text-xs text-gray-500 dark:text-gray-400 capitalize bg-gray-100 dark:bg-surface-lighter px-1.5 py-0.5 rounded mt-1 inline-block">
                            {{ post.tipo }}
                        </span>
                    </td>

                    <!-- Author Column -->
                    <td class="px-6 py-4">
                         <div class="flex items-center gap-2">
                             <img :src="post.user.avatar" class="w-6 h-6 rounded-full" />
                             <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ post.user.name }}</span>
                         </div>
                    </td>

                    <!-- Interactions Column -->
                    <td class="px-6 py-4">
                        <div class="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <div class="flex items-center gap-1" title="Curtidas">
                                <ThumbsUp :size="14" /> {{ post.curtidas_count }}
                            </div>
                            <div class="flex items-center gap-1" title="Comentários">
                                <MessageCircle :size="14" /> {{ post.comentarios_count }}
                            </div>
                        </div>
                    </td>

                    <!-- Date Column -->
                    <td class="px-6 py-4 whitespace-nowrap">
                        <span class="text-sm text-gray-500 dark:text-gray-400">{{ post.created_at }}</span>
                    </td>

                    <!-- Actions Column -->
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                             <button 
                                @click="handleAction('Ver Detalhes do Post', post.id)"
                                class="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors" 
                                title="Ver Post"
                            >
                                <Eye :size="18" />
                            </button>
                            <button 
                                @click="handleAction('Excluir Post', post.id)"
                                class="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors" 
                                title="Excluir Post"
                            >
                                <Trash2 :size="18" />
                            </button>
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>
