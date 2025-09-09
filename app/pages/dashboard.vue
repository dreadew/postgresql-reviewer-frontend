<template>
  <div class="space-y-6">
    <DashboardSection @navigate="handleNavigate" />
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'Обзор системы - PostgreSQL Reviewer',
  layout: 'default'
})

// Navigation handler
const handleNavigate = (tab: string) => {
  navigateTo(`/${tab}`)
}

// Load initial data when component mounts
onMounted(() => {
  const connectionsStore = useConnectionsStore()
  const schedulerStore = useSchedulerStore()
  
  connectionsStore.fetchConnections()
  schedulerStore.fetchTasks()
})
</script>