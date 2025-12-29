<script setup lang="ts">
import { Toaster } from 'vue-sonner'
import '@/assets/css/sonner.css'
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="top-center" richColors closeButton />
  </div>
</template>
