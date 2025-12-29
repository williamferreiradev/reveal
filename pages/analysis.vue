<script setup lang="ts">
import { 
  Eye, 
  Trash2, 
  Ban,
  Search,
  AlertTriangle,
  CheckCircle,
  Filter
} from 'lucide-vue-next'

definePageMeta({
  title: 'Análise de Risco',
  layout: 'default'
})

// State
const searchQuery = ref('')
const severityFilter = ref('all')
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('success')

// Data Refs
const suspiciousUsers = ref<any[]>([])
const { getRiskAnalysisData } = useDashboardData()

const fetchRiskData = async () => {
    const data = await getRiskAnalysisData()
    if (data) suspiciousUsers.value = data
}

onMounted(() => {
    fetchRiskData()
})

// Computed Filtered List
const filteredUsers = computed(() => {
    return suspiciousUsers.value.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                              user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                              user.reason.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesSeverity = severityFilter.value === 'all' || user.severity === severityFilter.value
        return matchesSearch && matchesSeverity
    })
})

// Actions Handler
const handleAction = (action: string, user: any) => {
    if (action === 'ban') {
        displayToast(`Usuário ${user.name} banido com sucesso!`, 'error')
    } else if (action === 'dismiss') {
        displayToast(`Alerta de ${user.name} descartado.`, 'success')
    } else {
        displayToast(`Detalhes de ${user.name} abertos para análise.`, 'info')
        return // Don't remove for view details
    }
    
    // Remove from list
    suspiciousUsers.value = suspiciousUsers.value.filter(u => u.id !== user.id)
}

const displayToast = (msg: string, type: string = 'success') => {
    toastMessage.value = msg
    toastType.value = type
    showToast.value = true
    setTimeout(() => showToast.value = false, 3000)
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

    <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <AlertTriangle class="text-orange-500" />
            Análise de Risco
        </h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Monitore usuários e conteúdos sinalizados por comportamento suspeito.</p>
    </header>

    <!-- Filters Bar -->
    <div class="flex flex-col sm:flex-row gap-4 mb-6 justify-between items-center">
        <!-- Search -->
        <div class="relative w-full sm:w-96">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" :size="20" />
            <input 
                v-model="searchQuery"
                type="text" 
                placeholder="Buscar por usuário, email ou motivo..." 
                class="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-surface border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
            >
        </div>

        <!-- Severity Filter -->
        <div class="flex items-center gap-2 bg-white dark:bg-surface p-1 rounded-lg border border-gray-200 dark:border-gray-800">
             <button 
                @click="severityFilter = 'all'"
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                :class="severityFilter === 'all' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
             >
                Todos
             </button>
             <button 
                @click="severityFilter = 'high'"
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                :class="severityFilter === 'high' ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
             >
                Alta
             </button>
             <button 
                @click="severityFilter = 'medium'"
                class="px-3 py-1.5 text-sm font-medium rounded-md transition-colors"
                :class="severityFilter === 'medium' ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'"
             >
                Média
             </button>
        </div>
    </div>

    <!-- Table Card -->
    <div class="bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm dark:shadow-none mb-8">
        <div class="p-4 bg-orange-500/10 border-b border-orange-500/20 flex items-center gap-3 text-orange-600 dark:text-orange-400">
             <Ban :size="20" />
             <span class="font-medium text-sm">Atenção: Estes usuários foram detectados automaticamente pelo filtro de segurança.</span>
        </div>
        
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-gray-50 dark:bg-surface-lighter border-b border-gray-200 dark:border-gray-800">
                        <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Usuário</th>
                        <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Motivo da Suspeita</th>
                        <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Gravidade</th>
                        <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Data</th>
                        <th class="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-200 dark:divide-gray-800">
                    <TransitionGroup 
                        enter-active-class="transform transition ease-out duration-300" 
                        enter-from-class="opacity-0 translate-x-4" 
                        enter-to-class="opacity-100 translate-x-0"
                        leave-active-class="transform transition ease-in duration-300"
                        leave-from-class="opacity-100 translate-x-0"
                        leave-to-class="opacity-0 -translate-x-4"
                    >
                        <tr v-for="user in filteredUsers" :key="user.id" class="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-full overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                                        <img :src="user.avatar" :alt="user.name" class="w-full h-full object-cover">
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-900 dark:text-white">{{ user.name }}</div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400">{{ user.email }}</div>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4">
                                <span class="block text-sm font-medium text-gray-900 dark:text-white">{{ user.reason }}</span>
                                <span v-if="user.snippet" class="block text-xs text-red-400 mt-1 italic">"{{ user.snippet }}"</span>
                            </td>
                            <td class="px-6 py-4">
                                <span 
                                    class="px-2 py-1 text-xs font-bold rounded uppercase border"
                                    :class="user.severity === 'high' 
                                        ? 'bg-red-100 text-red-600 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900' 
                                        : 'bg-yellow-100 text-yellow-600 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900'"
                                >
                                    {{ user.severity === 'high' ? 'Alta' : 'Média' }}
                                </span>
                            </td>
                            <td class="px-6 py-4">
                                <span class="text-sm text-gray-500 dark:text-gray-400">{{ user.date }}</span>
                            </td>
                            <td class="px-6 py-4 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button 
                                        @click="handleAction('ban', user)"
                                        class="p-2 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors" 
                                        title="Banir Imediatamente"
                                    >
                                        <Ban :size="18" />
                                    </button>
                                    <button 
                                        @click="handleAction('details', user)"
                                        class="p-2 rounded-lg text-blue-500 hover:bg-blue-500/10 transition-colors" 
                                        title="Analisar"
                                    >
                                        <Search :size="18" />
                                    </button>
                                    <button 
                                        @click="handleAction('dismiss', user)"
                                        class="p-2 rounded-lg text-gray-400 hover:bg-gray-500/10 transition-colors" 
                                        title="Ignorar"
                                    >
                                        <CheckCircle :size="18" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    </TransitionGroup>
                    
                    <tr v-if="filteredUsers.length === 0">
                        <td colspan="5" class="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                             <div class="flex flex-col items-center gap-3">
                                <CheckCircle :size="48" class="text-green-500 mb-2 opacity-50" />
                                <p class="text-lg font-medium">Tudo limpo por aqui!</p>
                                <p class="text-sm text-gray-400">Nenhuma suspeita encontrada com os filtros atuais.</p>
                             </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>
