<script setup lang="ts">
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

definePageMeta({
  layout: 'auth'
})

const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)

const handleLogin = async () => {
    // Validate inputs
    if (!email.value || !password.value) {
        toast.warning('Por favor, preencha todos os campos.')
        return
    }

    isLoading.value = true
    const toastId = toast.loading('Autenticando...', { duration: Infinity })

    try {
        // 1. Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email: email.value,
            password: password.value
        })

        if (authError) throw authError

        if (authData.user) {
            // 2. Check Admin Permission via Server
            try {
                const { data: { session } } = await supabase.auth.getSession()
                const token = session?.access_token

                if (!token) throw new Error('Falha ao obter token de sessão.')

                const { isAdmin } = await $fetch('/api/verify-access', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                if (!isAdmin) {
                    await supabase.auth.signOut()
                    throw new Error('Acesso negado. Você não tem permissão de administrador.')
                }

                // Success
                toast.dismiss(toastId)
                toast.success('Login realizado com sucesso! Redirecionando...')
                router.push('/')

            } catch (verr: any) {
                console.error('Verification error:', verr)
                await supabase.auth.signOut()
                const msg = verr.statusMessage || verr.message || 'Erro desconhecido na validação'
                throw new Error(`Falha de validação: ${msg}`)
            }
        }
    } catch (e: any) {
        console.error('Login error:', e)
        toast.dismiss(toastId)
        toast.error(e.message || 'Erro ao realizar login. Verifique suas credenciais.')
    } finally {
        isLoading.value = false
        // Ensure toast is dismissed if not already
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
                    Bem-vindo ao <br />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Reveal</span>
                </h1>

                <!-- Description -->
                <p class="text-lg text-gray-300 max-w-lg leading-relaxed">
                    Métricas confiáveis. Interface inteligente.
Acesse sua central de decisões com segurança e agilidade.
                </p>
            </div>

            <!-- RIGHT COLUMN: Glassmorphism Login Card -->
            <div class="w-full max-w-md mx-auto lg:mr-0 animate-fade-in-right">
                <div class="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group hover:border-white/30 transition-all duration-300">
                    
                    <!-- Shine Effect -->
                    <div class="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none"></div>

                    <div class="relative z-10">
                        <div class="text-center mb-10">
                            <h2 class="text-xl font-bold text-white uppercase tracking-widest mb-2">Bem-vindo Membro Exclusivo</h2>
                            <p class="text-xs text-gray-400 font-medium tracking-wide">FAÇA LOGIN PARA CONTINUAR</p>
                        </div>

                        <form @submit.prevent="handleLogin" class="space-y-6">
                            
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

                            <div class="space-y-2">
                                <div class="relative group">
                                    <Lock class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors" :size="20" />
                                    <input 
                                        v-model="password"
                                        :type="showPassword ? 'text' : 'password'" 
                                        placeholder="••••••••"
                                        class="w-full bg-black/20 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:bg-black/30 focus:border-white/30 transition-all font-medium"
                                    />
                                    <button 
                                        type="button" 
                                        @click="showPassword = !showPassword"
                                        class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
                                    >
                                        <component :is="showPassword ? Eye : EyeOff" :size="20" />
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                :disabled="isLoading"
                                class="w-full bg-gradient-to-r from-primary to-orange-600 hover:from-orange-500 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-lg transform active:scale-95 transition-all duration-200 flex items-center justify-between px-6 mt-4 group disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                <span>{{ isLoading ? 'Autenticando...' : 'Acessar minha conta' }}</span>
                                <ArrowRight v-if="!isLoading" class="group-hover:translate-x-1 transition-transform" :size="20" />
                                <div v-else class="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                            </button>

                        </form>

                        <div class="mt-8 text-center bg-transparent">
                            <a href="#" class="text-xs text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-gray-400 pb-0.5">
                                Tendo problemas com sua senha?
                            </a>
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

@keyframes timeLeft {
    from { opacity: 0; transform: translateX(-50px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes timeRight {
    from { opacity: 0; transform: translateX(50px); }
    to { opacity: 1; transform: translateX(0); }
}
</style>
