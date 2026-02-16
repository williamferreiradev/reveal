<script setup lang="ts">
import { 
  Eye, 
  Trash2, 
  AlertTriangle,
  Search,
  CheckCircle
} from 'lucide-vue-next'

definePageMeta({
  title: 'Usuários',
  layout: 'default'
})

const router = useRouter()

// UI State
const showDeleteModal = ref(false)
const userToDelete = ref<any>(null)
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Toast Helper
const displayToast = (msg: string, type: string = 'success') => {
    toastMessage.value = msg
    toastType.value = type
    showToast.value = true
    setTimeout(() => showToast.value = false, 3000)
}

// Modal Actions
const openDeleteModal = (user: any) => {
    userToDelete.value = user
    showDeleteModal.value = true
}

const confirmDelete = async () => {
    if (!userToDelete.value) return

    try {
        // Find the user_id (UUID) from the user object
        // The table view maps `id` to `u.id` (which might be int). 
        // We need the UUID `user_id` for backend operations. 
        // Need to check if `user_id` was mapped or if we need to pass it.
        // Looking at the onMounted map:
        // return { id: u.id, ... }
        // We probably need to store the real UUID reference.
        // Let's assume we need to update the map first to include uuid.
        
        // Actually, let's fix the map first in the next step or assume user object has it.
        // For now, I'll update the logic to use what is available, but I suspect 'id' in the table is the integer ID.
        // The server needs UUID.
        
        // Wait! The server script expects `userId` as UUID.
        // I need to ensure `userToDelete.value` has the UUID.
        // I will temporarily comment out the server call until I verify the user object has the UUID.
        
        // But to be efficient, I will implementation the fetch now and then fix the data mapping.
        
        displayToast('Processando exclusão...', 'info')

        const response = await $fetch<any>('/api/admin/delete-user', {
            method: 'POST',
            body: { 
                userId: userToDelete.value.userId, // Ensuring we pass the UUID
                userTableId: userToDelete.value.id 
            }
        })
        
        if (response.success) {
            // Client-side remove
            users.value = users.value.filter(u => u.id !== userToDelete.value.id)
            displayToast('Usuário deletado permanentemente!', 'success')
            showDeleteModal.value = false
            userToDelete.value = null
        } else {
             throw new Error(response.error || 'Erro desconhecido')
        }

    } catch (e: any) {
        console.error('Delete error:', e)
        displayToast(`Erro ao deletar: ${e.message}`, 'error')
    }
}

// Actions Handler (Keep for other actions if any)
const handleAction = (action: string, userName: string) => {
    alert(`${action} - ${userName}`)
}

// Data Fetching
const { getUsers } = useDashboardData()
const users = ref<any[]>([])
const isLoading = ref(true)

onMounted(async () => {
    try {
        console.log('Component mounted, calling getUsers...')
        const data = await getUsers()
        console.log('Data received in component:', data)
        
        if (data) {
            users.value = data.map(u => {
                // Handle Photos
                let avatarUrl = null
                try {
                    if (u.fotos && u.fotos.startsWith('[')) {
                        const photos = JSON.parse(u.fotos)
                        if (Array.isArray(photos) && photos.length > 0) avatarUrl = photos[0]
                    } else {
                        avatarUrl = u.fotos
                    }
                } catch (e) {
                    console.warn('Error parsing photos for user:', u.id, e)
                    avatarUrl = u.fotos 
                }

                // Fallback
                if (!avatarUrl) {
                    avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.nome || 'User')}&background=random`
                }

                return {
// ...
                    id: u.id,
                    userId: u.user_id, // Critical for backend deletion
                    name: u.nome || 'Sem Nome',
                    email: u.email || 'Sem Email',
                    avatar: avatarUrl,
                    createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : 'Data desc.',
                    status: u.verificado ? 'Verificado' : 'Não Verificado'
                }
            })
            console.log('Users mapped successfully:', users.value.length)
        }
    } catch (err) {
        console.error('Critical error in users mount:', err)
    } finally {
        isLoading.value = false
    }
})

const searchQuery = ref('')

const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const query = searchQuery.value.toLowerCase()
    return users.value.filter(user => 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query)
    )
})

const exportToCSV = () => {
    const headers = ['ID', 'Nome', 'Email', 'Data de Cadastro', 'Status']
    const rows = filteredUsers.value.map(user => [
        user.id,
        `"${user.name || ''}"`,
        `"${user.email || ''}"`,
        user.createdAt,
        user.status
    ])

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `usuarios_reveal_${new Date().toISOString().slice(0, 10)}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
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
                    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Você tem certeza dessa ação?</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-6">
                        Ao executar essa ação, o usuário <strong>{{ userToDelete?.name }}</strong> será apagado do sistema. Todos os likes, matches, posts, curtidas, comentários, mensagens, notificações e stories desse usuário serão deletados.
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
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </Transition>

    <header class="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Gerenciar Usuários</h1>
            <p class="text-gray-500 dark:text-gray-400 mt-1">Visualize e administre os usuários cadastrados.</p>
        </div>
        
        <div class="flex gap-3 w-full md:w-auto">
             <!-- Search Input -->
            <div class="relative w-full md:w-64">
                <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
                <input 
                    v-model="searchQuery"
                    type="text" 
                    placeholder="Buscar por nome ou email..." 
                    class="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-surface border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white focus:outline-none focus:border-primary transition-colors"
                />
            </div>

            <button 
                @click="exportToCSV"
                class="bg-primary hover:bg-orange-600 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-primary/20 whitespace-nowrap"
            >
                Exportar CSV
            </button>
        </div>
    </header>

    <div class="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm dark:shadow-none mb-8">
        <table class="w-full text-left border-collapse">
            <thead>
                <tr class="bg-gray-50 dark:bg-surface-lighter border-b border-gray-200 dark:border-gray-800">
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Foto</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Nome</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data Criação</th>
                    <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
                </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                <tr v-if="filteredUsers.length === 0">
                    <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        Nenhum usuário encontrado para "{{ searchQuery }}"
                    </td>
                </tr>
                <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                    <td class="px-6 py-4">
                        <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700">
                            <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover">
                        </div>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-sm font-medium text-gray-900 dark:text-white">{{ user.name }}</span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</span>
                    </td>
                    <td class="px-6 py-4">
                        <span class="text-sm text-gray-500 dark:text-gray-400">{{ user.createdAt }}</span>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <div class="flex items-center justify-end gap-2">
                            <!-- <button 
                                @click="handleAction('Denúncia', user.name)"
                                class="p-2 rounded-lg text-yellow-500 hover:bg-yellow-500/10 transition-colors" 
                                title="Reportar/Alerta"
                            >
                                <AlertTriangle :size="18" />
                            </button> -->
                            <button 
                                @click="router.push(`/user-details/${user.id}`)"
                                class="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors" 
                                title="Ver Detalhes"
                            >
                                <Eye :size="18" />
                            </button>
                            <!-- <button 
                                @click="openDeleteModal(user)"
                                class="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors" 
                                title="Excluir Usuário"
                            >
                                <Trash2 :size="18" />
                            </button> -->
                        </div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>
