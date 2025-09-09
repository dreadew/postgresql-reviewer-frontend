<template>
  <div class="space-y-6">
    <ConnectionsSection />
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'Подключения - PostgreSQL Reviewer',
  layout: 'default'
})

// Load initial data when component mounts
onMounted(() => {
  const connectionsStore = useConnectionsStore()
  connectionsStore.fetchConnections()
})
</script>