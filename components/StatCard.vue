<script setup lang="ts">
import { ArrowUpRight, ArrowDownRight } from 'lucide-vue-next'

defineProps<{
  title: string
  value: string
  trend: string
  trendLabel: string
  icon: any
  iconColorClass: string // e.g., 'bg-orange-500'
  isPositive?: boolean
}>()
</script>

<template>
  <div class="bg-white dark:bg-surface rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm dark:shadow-none transition-all hover:border-primary/50 flex justify-between items-start">
    <div class="flex flex-col justify-between h-full">
      <div>
        <h3 class="text-gray-500 dark:text-gray-400 text-sm font-medium">{{ title }}</h3>
        <p class="text-3xl font-bold text-gray-900 dark:text-white mt-1">{{ value }}</p>
      </div>
      
      <div class="flex items-center gap-1 mt-4 text-xs font-medium" :class="isPositive ? 'text-green-500' : 'text-red-500'">
        <component :is="isPositive ? ArrowUpRight : ArrowDownRight" :size="14" />
        <span>{{ trend }}</span>
        <span class="text-gray-400 dark:text-gray-500 font-normal ml-1">{{ trendLabel }}</span>
      </div>
    </div>

    <div class="p-3 rounded-xl text-white shadow-lg" :class="[iconColorClass, 'shadow-' + iconColorClass.replace('bg-', '') + '/30']">
      <component :is="icon" :size="24" />
    </div>
  </div>
</template>
