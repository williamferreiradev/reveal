<script setup lang="ts">
defineProps<{
  variant?: 'solid' | 'outline' | 'ghost'
  block?: boolean
}>()
</script>

<template>
  <button
    class="px-6 py-2 rounded-lg font-medium transition-colors duration-200"
    :class="[
      block ? 'w-full' : '',
      variant === 'outline' 
        ? 'border-2 border-primary text-primary hover:bg-primary/10' 
        : variant === 'ghost'
        ? 'text-primary hover:bg-primary/10'
        : 'bg-primary text-white hover:bg-primary/90' // default solid
    ]"
  >
    <slot />
  </button>
</template>
