<script setup lang="ts">
import { Mail, MessageSquare, User, ArrowRight, CheckCircle2 } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'auth'
})

const nome = ref('')
const email = ref('')
const mensagem = ref('')
const isLoading = ref(false)
const showSuccess = ref(false)

const handleSubmit = async () => {
    // Validate inputs
    if (!nome.value || !email.value || !mensagem.value) {
        toast.warning('Por favor, preencha todos os campos.')
        return
    }

    isLoading.value = true
    const toastId = toast.loading('Enviando mensagem...', { duration: Infinity })

    try {
        // Call API to save support message
        const response = await $fetch('/api/suporte', {
            method: 'POST',
            body: {
                nome: nome.value,
                email: email.value,
                mensagem: mensagem.value
            }
        })
        
        toast.dismiss(toastId)
        
        // Show success state
        showSuccess.value = true
        
        // Clear only message field, keep nome and email for next message
        mensagem.value = ''
        
    } catch (e: any) {
        console.error('Submit error:', e)
        toast.dismiss(toastId)
        
        // Handle specific error messages from API
        const errorMessage = e.data?.statusMessage || e.statusMessage || e.message || 'Erro ao enviar mensagem. Tente novamente.'
        toast.error(errorMessage)
    } finally {
        isLoading.value = false
        setTimeout(() => toast.dismiss(toastId), 5000) 
    }
}
</script>

<template>
  <div class="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#121212]">
    
    <!-- Custom Background Image -->
    <div class="absolute top-0 left-0 w-full h-full">
        <img src="/login-bg.png" alt="Background" class="w-full h-full object-cover opacity-100" />
        <div class="absolute inset-0 bg-black/30"></div> 
    </div>

    <!-- Main Container -->
    <div class="container mx-auto px-6 md:px-12 relative z-10 w-full max-w-7xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            <!-- LEFT COLUMN: Branding & Text -->
            <div class="text-white space-y-8 animate-fade-in-left">
                <!-- Branding -->
                <div class="flex items-center gap-4">
                     <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                        <span class="text-white font-bold text-3xl">R</span>
                    </div>
                    <span class="text-4xl font-bold tracking-wide">Reveal</span>
                </div>

                <!-- Big Title -->
                <h1 class="text-5xl md:text-6xl font-bold leading-tight">
                    Precisa de <br />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Suporte?</span>
                </h1>

                <!-- Description -->
                <p class="text-lg text-gray-300 max-w-lg leading-relaxed">
                    Nossa equipe está pronta para ajudar você.
                    Entre em contato e responderemos o mais rápido possível.
                </p>

                <!-- Support Info -->
                <div class="space-y-4 pt-4">
                    <div class="flex items-center gap-3 text-gray-300">
                        <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <Mail :size="20" class="text-primary" />
                        </div>
                        <span class="text-sm">suporte@reveal.com</span>
                    </div>
                    <div class="flex items-center gap-3 text-gray-300">
                        <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                            <MessageSquare :size="20" class="text-primary" />
                        </div>
                        <span class="text-sm">Resposta em até 24 horas</span>
                    </div>
                </div>
            </div>

            <!-- RIGHT COLUMN: Glassmorphism Contact Card -->
            <div class="w-full max-w-md mx-auto lg:mr-0 animate-fade-in-right">
                <div class="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group hover:border-white/30 transition-all duration-300">
                    
                    <!-- Shine Effect -->
                    <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>

                    <div class="relative z-10">
                        <!-- Success State -->
                        <div v-if="showSuccess" class="text-center space-y-8 animate-fade-in">
                            <!-- Success Icon -->
                            <div class="flex justify-center">
                                <div class="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30 animate-scale-in">
                                    <CheckCircle2 :size="48" class="text-white" />
                                </div>
                            </div>

                            <!-- Success Message -->
                            <div class="space-y-4">
                                <h2 class="text-2xl font-bold text-white">Mensagem Enviada!</h2>
                                <p class="text-gray-300 text-sm leading-relaxed">
                                    Recebemos sua mensagem com sucesso.<br />
                                    Nossa equipe entrará em contato em breve.
                                </p>
                            </div>

                            <!-- Back to App Button -->
                            <a 
                                href="reveal://reveal.com/homePage"
                                class="inline-flex items-center justify-center gap-3 w-full bg-gradient-to-r from-primary to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl shadow-lg transform hover:scale-105 active:scale-95 transition-all duration-200"
                            >
                                <span>Voltar para o App</span>
                                <ArrowRight :size="20" />
                            </a>

                            <!-- Send Another Message -->
                            <button 
                                @click="showSuccess = false"
                                class="text-xs text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-gray-400 pb-0.5"
                            >
                                Enviar outra mensagem
                            </button>
                        </div>

                        <!-- Form State -->
                        <div v-else>
                            <div class="text-center mb-10">
                                <h2 class="text-xl font-bold text-white uppercase tracking-widest mb-2">Central de Suporte</h2>
                                <p class="text-xs text-gray-400 font-medium tracking-wide">ENVIE SUA MENSAGEM</p>
                            </div>

                            <form @submit.prevent="handleSubmit" class="space-y-6">
                                
                                <!-- Nome -->
                                <div class="space-y-2">
                                    <div class="relative group">
                                        <User class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" :size="20" />
                                        <input 
                                            v-model="nome"
                                            type="text" 
                                            placeholder="Seu nome completo"
                                            class="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:bg-black/30 focus:border-white/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <!-- Email -->
                                <div class="space-y-2">
                                    <div class="relative group">
                                        <Mail class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" :size="20" />
                                        <input 
                                            v-model="email"
                                            type="email" 
                                            placeholder="seu@email.com"
                                            class="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:bg-black/30 focus:border-white/30 transition-all font-medium"
                                        />
                                    </div>
                                </div>

                                <!-- Mensagem -->
                                <div class="space-y-2">
                                    <div class="relative group">
                                        <MessageSquare class="absolute left-4 top-4 text-gray-400 group-focus-within:text-white transition-colors" :size="20" />
                                        <textarea 
                                            v-model="mensagem"
                                            placeholder="Descreva seu problema ou dúvida..."
                                            rows="5"
                                            class="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-gray-400 focus:outline-none focus:bg-black/30 focus:border-white/30 transition-all font-medium resize-none"
                                        ></textarea>
                                    </div>
                                </div>

                                <button 
                                    type="submit"
                                    :disabled="isLoading"
                                    class="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-between px-6 mt-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    <span>{{ isLoading ? 'Enviando...' : 'Enviar mensagem' }}</span>
                                    <ArrowRight v-if="!isLoading" class="group-hover:translate-x-1 transition-transform" :size="20" />
                                    <div v-else class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                </button>

                            </form>

                            <div class="mt-8 text-center bg-transparent">
                                <a href="reveal://reveal.com/homePage" class="text-xs text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-gray-400 pb-0.5">
                                    Voltar para o app
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in-left {
    animation: timeLeft 1s ease-out forwards;
}
.animate-fade-in-right {
    animation: timeRight 1s ease-out forwards;
}
.animate-fade-in {
    animation: fadeIn 0.6s ease-out forwards;
}
.animate-scale-in {
    animation: scaleIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes timeLeft {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes timeRight {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from { opacity: 0; transform: scale(0); }
    to { opacity: 1; transform: scale(1); }
}
</style>
