<script setup lang="ts">
defineProps<{
  modelValue?: string
  placeholder?: string
  label?: string
  type?: string
}>()

defineEmits(['update:modelValue'])
</script>

<template>
  <div class="flex flex-col gap-1">
    <label v-if="label" class="text-sm font-medium text-gray-300">{{ label }}</label>
    <input
      :value="modelValue"
      :type="type || 'text'"
      :placeholder="placeholder"
      class="px-4 py-2 bg-gray-800 border-2 border-transparent rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary transition-colors duration-200"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>
