<script setup lang="ts">
import { MessageSquare, Mail, Clock, CheckCheck } from 'lucide-vue-next'

definePageMeta({
  title: 'Suporte',
  layout: 'default'
})

const supabase = useSupabaseClient()

// State
const mensagens = ref<any[]>([])
const isLoading = ref(true)
const selectedMessage = ref<any>(null)

// Fetch support messages
const fetchMensagens = async () => {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('suporte')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    mensagens.value = data || []
  } catch (error) {
    console.error('Erro ao buscar mensagens:', error)
  } finally {
    isLoading.value = false
  }
}

// Mark message as read
const markAsRead = async (id: number) => {
  try {
    const { error } = await supabase
      .from('suporte')
      .update({ lido: true })
      .eq('id', id)

    if (error) throw error
    
    // Update local state
    const message = mensagens.value.find(m => m.id === id)
    if (message) message.lido = true
  } catch (error) {
    console.error('Erro ao marcar como lido:', error)
  }
}

// Select message and mark as read
const selectMessage = (message: any) => {
  selectedMessage.value = message
  if (!message.lido) {
    markAsRead(message.id)
  }
}

// Format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } else if (days === 1) {
    return 'Ontem'
  } else if (days < 7) {
    return `${days} dias atrás`
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }
}

// Count unread messages
const unreadCount = computed(() => mensagens.value.filter(m => !m.lido).length)

// Load messages on mount
onMounted(() => {
  fetchMensagens()
})
</script>

<template>
  <div>
    <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Mensagens de Suporte</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">
          Central de atendimento ao cliente
          <span v-if="unreadCount > 0" class="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
            {{ unreadCount }} não lida{{ unreadCount > 1 ? 's' : '' }}
          </span>
        </p>
    </header>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center h-96">
      <div class="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>

    <!-- Messages List -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Left: Messages List -->
      <div class="lg:col-span-1 bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden">
        <div class="p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <MessageSquare :size="20" class="text-primary" />
            Mensagens ({{ mensagens.length }})
          </h2>
        </div>

        <!-- Empty State -->
        <div v-if="mensagens.length === 0" class="p-8 text-center">
          <div class="p-4 bg-gray-100 dark:bg-gray-800 rounded-full inline-block mb-4">
            <MessageSquare :size="32" class="text-gray-400" />
          </div>
          <p class="text-gray-500 dark:text-gray-400">Nenhuma mensagem ainda</p>
        </div>

        <!-- Messages -->
        <div v-else class="overflow-y-auto max-h-[calc(100vh-300px)]">
          <button
            v-for="msg in mensagens"
            :key="msg.id"
            @click="selectMessage(msg)"
            :class="[
              'w-full p-4 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-left',
              selectedMessage?.id === msg.id ? 'bg-primary/5 dark:bg-primary/10' : '',
              !msg.lido ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
            ]"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ msg.nome }}</h3>
                  <CheckCheck v-if="msg.lido" :size="16" class="text-blue-500 flex-shrink-0" />
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400 truncate">{{ msg.email }}</p>
                <p class="text-sm text-gray-500 dark:text-gray-500 truncate mt-1">{{ msg.texto }}</p>
              </div>
              <div class="flex flex-col items-end gap-1 flex-shrink-0">
                <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(msg.created_at) }}</span>
                <span v-if="!msg.lido" class="w-2 h-2 bg-primary rounded-full"></span>
              </div>
            </div>
          </button>
        </div>
      </div>

      <!-- Right: Message Detail -->
      <div class="lg:col-span-2 bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none overflow-hidden">
        
        <!-- No Selection -->
        <div v-if="!selectedMessage" class="flex flex-col items-center justify-center h-full min-h-[400px] p-8">
          <div class="p-6 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
            <MessageSquare :size="48" class="text-gray-400" />
          </div>
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">Selecione uma mensagem</h3>
          <p class="text-gray-500 dark:text-gray-400 text-center max-w-md">
            Clique em uma mensagem da lista para visualizar os detalhes completos
          </p>
        </div>

        <!-- Message Detail -->
        <div v-else class="flex flex-col h-full">
          <!-- Header -->
          <div class="p-6 border-b border-gray-200 dark:border-gray-800">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">{{ selectedMessage.nome }}</h2>
                <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div class="flex items-center gap-2">
                    <Mail :size="16" />
                    <span>{{ selectedMessage.email }}</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Clock :size="16" />
                    <span>{{ new Date(selectedMessage.created_at).toLocaleString('pt-BR') }}</span>
                  </div>
                </div>
              </div>
              <div class="flex items-center gap-2">
                <span 
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium',
                    selectedMessage.lido 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                      : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                  ]"
                >
                  {{ selectedMessage.lido ? 'Lida' : 'Não lida' }}
                </span>
              </div>
            </div>
          </div>

          <!-- Message Content -->
          <div class="flex-1 p-6 overflow-y-auto">
            <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6">
              <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Mensagem</h3>
              <p class="text-gray-900 dark:text-white whitespace-pre-wrap leading-relaxed">{{ selectedMessage.texto }}</p>
            </div>
          </div>

          <!-- Footer Actions -->
          <div class="p-6 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
            <div class="flex items-center justify-between">
              <p class="text-sm text-gray-500 dark:text-gray-400">
                ID da mensagem: #{{ selectedMessage.id }}
              </p>
              <button
                v-if="!selectedMessage.lido"
                @click="markAsRead(selectedMessage.id)"
                class="px-4 py-2 bg-primary hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Marcar como lida
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
