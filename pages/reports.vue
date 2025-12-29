<script setup lang="ts">
definePageMeta({
  title: 'Denúncias',
  layout: 'default'
})
</script>

<template>
  <div>
    <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Denúncias</h1>
        <p class="text-gray-500 dark:text-gray-400 mt-1">Central de segurança e reports.</p>
    </header>

    <div class="flex flex-col items-center justify-center h-96 bg-white dark:bg-surface rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed shadow-sm dark:shadow-none transition-colors">
        <div class="p-4 bg-orange-500/10 rounded-full mb-4">
             <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
        </div>
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Em Breve</h2>
        <p class="text-gray-500 dark:text-gray-400 max-w-md text-center">Estamos trabalhando para trazer uma central de denúncias completa e segura para você.</p>
    </div>
  </div>
</template>
