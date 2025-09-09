<template>
  <div class="space-y-6">
    <SchedulerSection />
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'Планировщик задач - PostgreSQL Reviewer',
  layout: 'default'
})

// Load initial data when component mounts
onMounted(() => {
  const schedulerStore = useSchedulerStore()
  const connectionsStore = useConnectionsStore()
  
  schedulerStore.fetchTasks()
  connectionsStore.fetchConnections()
})
</script>