<script setup lang="ts">
// Page meta for Nuxt (optional but good practice)
definePageMeta({
  title: 'Design System'
})
</script>

<template>
  <div class="min-h-screen bg-gray-900 p-8 text-white">
    <div class="max-w-4xl mx-auto space-y-12">
      
      <!-- Header -->
      <div class="space-y-2">
        <h1 class="text-4xl font-bold text-primary">Design System</h1>
        <p class="text-gray-400">Component library and style guide</p>
      </div>

      <!-- Colors -->
      <section class="space-y-4">
        <h2 class="text-2xl font-bold border-b border-gray-700 pb-2">Colors</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="space-y-2">
            <div class="h-24 rounded-lg bg-primary shadow-lg flex items-center justify-center font-bold text-black bg-opacity-100"></div>
            <p class="text-sm font-mono text-gray-400">Primary: #FF7A00</p>
          </div>
        </div>
      </section>

      <!-- Buttons -->
      <section class="space-y-4">
        <h2 class="text-2xl font-bold border-b border-gray-700 pb-2">Buttons</h2>
        <div class="flex flex-wrap gap-4 items-center">
          <BaseButton>Solid Button</BaseButton>
          <BaseButton variant="outline">Outline Button</BaseButton>
          <BaseButton variant="ghost">Ghost Button</BaseButton>
        </div>
        <div class="mt-4">
           <BaseButton block>Block Button</BaseButton>
        </div>
      </section>

      <!-- Inputs -->
      <section class="space-y-4">
        <h2 class="text-2xl font-bold border-b border-gray-700 pb-2">Inputs</h2>
        <div class="grid gap-4 max-w-md">
          <BaseInput label="Default Input" placeholder="Type something..." />
          <BaseInput label="Search Input" placeholder="Search..." type="search" />
        </div>
      </section>

    </div>
  </div>
</template>
