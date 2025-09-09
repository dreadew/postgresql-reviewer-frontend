<template>
  <div class="space-y-6">
    <RulesSection />
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'Правила анализа - PostgreSQL Reviewer',
  layout: 'default'
})

// Load initial data when component mounts
onMounted(() => {
  const rulesStore = useRulesStore()
  rulesStore.fetchRules()
})
</script>