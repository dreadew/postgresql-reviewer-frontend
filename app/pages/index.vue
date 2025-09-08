<template>
  <div>
    <!-- Navigation -->
    <div class="modern-nav">
      <nav class="flex space-x-2 p-2">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'nav-tab',
            activeTab === tab.id ? 'nav-tab-active' : 'nav-tab-inactive'
          ]"
        >
          {{ tab.name }}
        </button>
      </nav>
    </div>

    <!-- Content Sections -->
    <!-- Dashboard Section -->
    <div v-if="activeTab === 'dashboard'" class="space-y-6">
      <DashboardSection @navigate="handleNavigate" />
    </div>

    <!-- Connections Section -->
    <div v-if="activeTab === 'connections'" class="space-y-6">
      <ConnectionsSection />
    </div>

    <!-- Scheduler Section -->
    <div v-if="activeTab === 'scheduler'" class="space-y-6">
      <SchedulerSection />
    </div>

    <!-- Rules Section -->
    <div v-if="activeTab === 'rules'" class="space-y-6">
      <RulesSection />
    </div>

    <!-- Config Analysis Section -->
    <div v-if="activeTab === 'config-analysis'" class="space-y-6">
      <ConfigAnalysisSection />
    </div>

    <!-- SQL Review Section -->
    <div v-if="activeTab === 'sql-review'" class="space-y-6">
      <SQLReviewSection />
    </div>

    <!-- Log Analysis Section -->
    <div v-if="activeTab === 'log-analysis'" class="space-y-6">
      <LogAnalysisSection />
    </div>
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'PostgreSQL Reviewer',
  layout: 'default'
})

// Reactive data
const activeTab = ref('scheduler')

const tabs = [
  { id: 'dashboard', name: 'Обзор' },
  { id: 'connections', name: 'Подключения' },
  { id: 'scheduler', name: 'Планировщик' },
  { id: 'rules', name: 'Правила' },
  { id: 'config-analysis', name: 'Анализ конфигурации' },
  { id: 'sql-review', name: 'Анализ SQL' },
  { id: 'log-analysis', name: 'Анализ логов' }
]

// Navigation handler
const handleNavigate = (tab: string) => {
  activeTab.value = tab
}

// Load initial data when component mounts
onMounted(() => {
  // Initialize stores if needed
  const connectionsStore = useConnectionsStore()
  const schedulerStore = useSchedulerStore()
  const rulesStore = useRulesStore()

  // Load initial data
  connectionsStore.fetchConnections()
  schedulerStore.fetchTasks()
  rulesStore.fetchRules()
})
</script>

<style scoped>
.modern-nav {
  background: white;
  border-radius: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  margin-bottom: 2rem;
  border: 1px solid rgb(229 231 235);
  backdrop-filter: blur(10px);
}

.nav-tab {
  padding: 0.75rem 1.5rem;
  border-radius: 1.25rem;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.nav-tab:active {
  transform: translateY(0px);
}

.nav-tab-active {
  background: linear-gradient(135deg, rgb(59 130 246) 0%, rgb(147 51 234) 100%);
  color: white;
  box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.4);
  transform: translateY(-1px);
}

.nav-tab-active::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0) 100%);
  pointer-events: none;
}

.nav-tab-inactive {
  color: rgb(107 114 128);
  background: transparent;
}

.nav-tab-inactive:hover {
  color: rgb(59 130 246);
  background: rgb(239 246 255);
  transform: translateY(-1px);
}
</style>
