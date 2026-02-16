<script setup lang="ts">
import { ShieldCheck, Eye, AlertTriangle, Gavel, ExternalLink, Mail } from 'lucide-vue-next'

definePageMeta({
  layout: 'auth'
})

useHead({
  title: 'Segurança Infantil - Reveal',
  meta: [
    { name: 'description', content: 'Compromisso do Reveal com a segurança infantil e tolerância zero contra abusos.' }
  ]
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
    <div class="max-w-4xl w-full space-y-12">
      
      <!-- Header -->
      <div class="text-center space-y-4">
        <div class="mx-auto h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
          <ShieldCheck class="h-10 w-10 text-primary" />
        </div>
        <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
          Compromisso com a Segurança Infantil
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Nossa prioridade absoluta é criar um ambiente seguro e protegido. Não toleramos qualquer forma de exploração ou abuso infantil.
        </p>
      </div>

      <!-- Tolerância Zero -->
      <div class="bg-white dark:bg-surface rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 text-center">
        <h2 class="text-2xl font-bold text-red-600 mb-4 flex items-center justify-center gap-2">
          <AlertTriangle class="h-6 w-6" />
          Política de Tolerância Zero
        </h2>
        <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
          O Reveal proíbe estritamente qualquer conteúdo, comportamento ou interação que envolva abuso sexual infantil (CSAE), exploração ou perigo para menores. O uso do aplicativo é restrito a maiores de 18 anos. Qualquer violação resultará em banimento imediato e denúncia às autoridades competentes.
        </p>
      </div>

      <!-- Pilares -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        <!-- Monitoramento -->
        <div class="bg-white dark:bg-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors">
          <div class="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
            <Eye class="h-6 w-6" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Monitoramento Ativo</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Utilizamos tecnologia e revisão humana para monitorar perfis e conteúdos suspeitos constantemente.
          </p>
        </div>

        <!-- Denúncia -->
        <div class="bg-white dark:bg-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors">
          <div class="h-12 w-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4 text-orange-600 dark:text-orange-400">
            <Mail class="h-6 w-6" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Canais de Denúncia</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Ferramentas integradas permitem reportar qualquer comportamento inadequado de forma rápida e anônima.
          </p>
        </div>

        <!-- Ação Legal -->
        <div class="bg-white dark:bg-surface p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-primary/30 transition-colors">
          <div class="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mb-4 text-red-600 dark:text-red-400">
            <Gavel class="h-6 w-6" />
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">Ação e Cooperação</h3>
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Colaboramos ativamente com autoridades policiais e organizações de proteção infantil (NCMEC) em investigações.
          </p>
        </div>
      </div>

      <!-- Rodapé / Contato -->
      <div class="text-center space-y-6 pt-8 border-t border-gray-200 dark:border-gray-800">
        <div class="flex flex-col items-center gap-2">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contato de Segurança</span>
          <a href="mailto:gabrielbandeldev@gmail.com" class="text-lg font-bold text-gray-900 dark:text-white hover:text-primary transition-colors flex items-center gap-2">
            <Mail class="h-5 w-5" />
            gabrielbandeldev@gmail.com
          </a>
        </div>

        <div class="flex justify-center">
          <a 
            href="https://new.safernet.org.br/denuncie" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg shadow-red-600/20"
          >
            <ExternalLink class="h-5 w-5" />
            Fazer Denúncia Externa (SaferNet)
          </a>
        </div>
        
        <p class="text-xs text-gray-400 dark:text-gray-500 max-w-lg mx-auto mt-8">
          Se você suspeita que uma criança está em perigo imediato, entre em contato com a polícia local ou disque 100 (Disque Direitos Humanos).
        </p>
      </div>

    </div>
  </div>
</template>
