<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">Управление правилами анализа</h2>
      <button
        @click="openCreateModal"
        class="btn btn-primary btn-md"
      >
        Создать правило
      </button>
    </div>

    <!-- Filter Controls -->
    <div class="card p-4">
      <div class="flex items-center space-x-4">
        <div>
          <label for="category-filter" class="label">Категория:</label>
          <select
            id="category-filter"
            v-model="selectedCategory"
            @change="onCategoryChange"
            class="input w-48"
          >
            <option value="">Все</option>
            <option value="config">Конфигурация</option>
            <option value="sql">SQL запросы</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Error Alert -->
    <div
      v-if="rulesStore.error"
      class="bg-red-50 border border-red-200 rounded-md p-4"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-800">{{ rulesStore.error }}</p>
        </div>
        <div class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button
              @click="rulesStore.clearError()"
              class="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100"
            >
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="rulesStore.loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>

    <!-- Rules Table -->
    <div v-else class="card overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Файл
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Заголовок
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Категория
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="rule in filteredRules" :key="`${rule.category}-${rule.filename}`">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ rule.filename }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ rule.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="[
                  'status-badge',
                  rule.category === 'config' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                ]"
              >
                {{ getCategoryLabel(rule.category) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
              <button
                @click="viewRule(rule)"
                class="btn btn-secondary btn-sm"
              >
                Просмотр
              </button>
              <button
                @click="editRule(rule)"
                class="btn btn-secondary btn-sm"
              >
                Редактировать
              </button>
              <button
                @click="deleteRule(rule)"
                class="btn btn-danger btn-sm"
                :disabled="rulesStore.loading"
              >
                Удалить
              </button>
            </td>
          </tr>
          <tr v-if="filteredRules.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              Правила не найдены
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Create/Edit Modal -->
    <RuleModal
      :is-open="isModalOpen"
      :rule="selectedRule"
      @close="closeModal"
      @saved="onRuleSaved"
    />

    <!-- View Modal -->
    <RuleViewModal
      :is-open="isViewModalOpen"
      :rule="viewingRule"
      @close="closeViewModal"
    />
  </div>
</template>

<script setup lang="ts">
import type { Rule } from '~/types/api'

const rulesStore = useRulesStore()
const toast = inject('toast') as any

// Reactive state
const selectedCategory = ref('')
const isModalOpen = ref(false)
const selectedRule = ref<Rule | null>(null)
const isViewModalOpen = ref(false)
const viewingRule = ref<Rule | null>(null)

// Computed
const filteredRules = computed(() => {
  if (!selectedCategory.value) {
    return rulesStore.rules
  }
  return rulesStore.rulesByCategory(selectedCategory.value)
})

// Methods
const onCategoryChange = () => {
  rulesStore.setCategory(selectedCategory.value)
}

const openCreateModal = () => {
  selectedRule.value = null
  isModalOpen.value = true
}

const editRule = (rule: Rule) => {
  selectedRule.value = rule
  isModalOpen.value = true
}

const viewRule = async (rule: Rule) => {
  try {
    const fullRule = await rulesStore.getRule(rule.category, rule.filename)
    viewingRule.value = fullRule
    isViewModalOpen.value = true
  } catch (error) {
    toast?.error('Ошибка при загрузке правила')
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedRule.value = null
}

const closeViewModal = () => {
  isViewModalOpen.value = false
  viewingRule.value = null
}

const onRuleSaved = () => {
  closeModal()
  toast?.success('Правило успешно сохранено!')
}

const deleteRule = async (rule: Rule) => {
  if (!confirm('Вы уверены, что хотите удалить это правило?')) {
    return
  }

  try {
    await rulesStore.deleteRule(rule.category, rule.filename)
    toast?.success('Правило удалено!')
  } catch (error) {
    console.error('Delete rule error:', error)
    toast?.error('Ошибка при удалении правила')
  }
}

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'config': 'Конфигурация',
    'sql': 'SQL запросы'
  }
  return labels[category] || category
}

// Sync local category with store
watch(() => rulesStore.selectedCategory, (category) => {
  selectedCategory.value = category
}, { immediate: true })
</script>
