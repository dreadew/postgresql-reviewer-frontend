<template>
  <div>
    <!-- Navigation -->
    <div class="modern-nav">
      <nav class="nav-container">
        <div class="nav-wrapper">
          <NuxtLink
            v-for="tab in tabs"
            :key="tab.id"
            :to="tab.route"
            :class="[
              'nav-tab',
              $route.path === tab.route ? 'nav-tab-active' : 'nav-tab-inactive'
            ]"
          >
            <Icon :name="tab.icon" class="nav-icon" />
            <span class="nav-label">{{ tab.name }}</span>
          </NuxtLink>
        </div>
      </nav>
    </div>

    <!-- Welcome Section -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">PostgreSQL Reviewer</h1>
        <p class="welcome-description">
          Профессиональный инструмент для анализа и мониторинга PostgreSQL баз данных
        </p>
        <div class="quick-actions">
          <NuxtLink to="/dashboard" class="action-btn action-btn-primary">
            <Icon name="heroicons:chart-bar" class="w-5 h-5" />
            Открыть обзор
          </NuxtLink>
          <NuxtLink to="/scheduler" class="action-btn action-btn-secondary">
            <Icon name="heroicons:clock" class="w-5 h-5" />
            Планировщик
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Page meta
definePageMeta({
  title: 'PostgreSQL Reviewer',
  layout: 'default'
})

// Auto-redirect to dashboard
onMounted(() => {
  navigateTo('/dashboard')
})

const tabs = [
  { 
    id: 'dashboard', 
    name: 'Обзор', 
    route: '/dashboard',
    icon: 'heroicons:chart-bar'
  },
  { 
    id: 'connections', 
    name: 'Подключения', 
    route: '/connections',
    icon: 'heroicons:server-stack'
  },
  { 
    id: 'scheduler', 
    name: 'Планировщик', 
    route: '/scheduler',
    icon: 'heroicons:clock'
  },
  { 
    id: 'rules', 
    name: 'Правила', 
    route: '/rules',
    icon: 'heroicons:document-check'
  },
  { 
    id: 'config-analysis', 
    name: 'Анализ конфигурации', 
    route: '/config-analysis',
    icon: 'heroicons:cog-6-tooth'
  },
  { 
    id: 'sql-review', 
    name: 'Анализ SQL', 
    route: '/sql-review',
    icon: 'heroicons:magnifying-glass'
  },
  { 
    id: 'log-analysis', 
    name: 'Анализ логов', 
    route: '/log-analysis',
    icon: 'heroicons:document-text'
  }
]
</script>

<style scoped>
/* Navigation Styles */
.modern-nav {
  background: white;
  border-radius: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  margin-bottom: 32px;
  border: 1px solid rgb(229 231 235);
  overflow: hidden;
}

.nav-container {
  padding: 8px;
}

.nav-wrapper {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.nav-wrapper::-webkit-scrollbar {
  display: none;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 12px;
  font-weight: 500;
  font-size: 14px;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;
  min-width: fit-content;
}

.nav-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.nav-label {
  display: none;
}

.nav-tab-active {
  background: rgb(99 102 241);
  color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}

.nav-tab-inactive {
  color: rgb(107 114 128);
  background: transparent;
}

.nav-tab-inactive:hover {
  color: rgb(79 70 229);
  background: rgb(238 242 255);
}

/* Welcome Section */
.welcome-section {
  background: linear-gradient(to bottom right, rgb(249 250 251), rgb(243 244 246));
  border-radius: 24px;
  padding: 48px 32px;
  text-align: center;
  border: 1px solid rgb(229 231 235);
}

.welcome-content {
  max-width: 600px;
  margin: 0 auto;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: rgb(17 24 39);
  margin-bottom: 16px;
}

.welcome-description {
  font-size: 1.125rem;
  color: rgb(107 114 128);
  margin-bottom: 32px;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  border: 1px solid transparent;
}

.action-btn-primary {
  background: rgb(99 102 241);
  color: white;
  border-color: rgb(99 102 241);
}

.action-btn-primary:hover {
  background: rgb(79 70 229);
  border-color: rgb(79 70 229);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.action-btn-secondary {
  background: white;
  color: rgb(107 114 128);
  border-color: rgb(229 231 235);
}

.action-btn-secondary:hover {
  background: rgb(249 250 251);
  color: rgb(79 70 229);
  border-color: rgb(196 181 253);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Mobile Responsive */
@media (min-width: 640px) {
  .nav-label {
    display: block;
  }
  
  .nav-tab {
    padding: 12px 20px;
  }
}

@media (min-width: 768px) {
  .nav-wrapper {
    overflow-x: visible;
  }
  
  .welcome-section {
    padding: 64px 48px;
  }
  
  .welcome-title {
    font-size: 3rem;
  }
}
</style>
