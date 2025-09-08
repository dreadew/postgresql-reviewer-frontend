<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="border-b border-gray-200 px-6 py-4">
      <h3 class="text-lg font-semibold text-gray-900">Анализ SQL запросов</h3>
      <p class="text-sm text-gray-600 mt-1">Проанализируйте SQL запросы на производительность, безопасность и соответствие best practices</p>
    </div>

    <!-- Form -->
    <div class="p-6">
      <form @submit.prevent="reviewSQL" class="space-y-6">
        <!-- SQL Query -->
        <div>
          <label for="sql" class="block text-sm font-medium text-gray-700 mb-2">SQL запрос</label>
          <textarea 
            id="sql"
            v-model="form.sql"
            rows="8"
            placeholder="SELECT u.id, u.name, COUNT(o.id) as order_count 
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
WHERE u.created_at > '2024-01-01' 
GROUP BY u.id, u.name 
ORDER BY order_count DESC"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          ></textarea>
        </div>

        <!-- Environment and Thread ID -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="sql-environment" class="block text-sm font-medium text-gray-700 mb-2">Среда</label>
            <select 
              id="sql-environment"
              v-model="form.environment" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
              <option value="testing">Testing</option>
            </select>
          </div>
          <div>
            <label for="thread-id" class="block text-sm font-medium text-gray-700 mb-2">Thread ID (опционально)</label>
            <input 
              id="thread-id"
              v-model="form.thread_id"
              type="text" 
              placeholder="thread_123"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
        </div>

        <!-- Server Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="sql-version" class="block text-sm font-medium text-gray-700 mb-2">Версия PostgreSQL</label>
            <input 
              id="sql-version"
              v-model="form.server_info.version"
              type="text" 
              placeholder="15.4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <div>
            <label for="sql-host" class="block text-sm font-medium text-gray-700 mb-2">Хост</label>
            <input 
              id="sql-host"
              v-model="form.server_info.host"
              type="text" 
              placeholder="localhost"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <div>
            <label for="sql-database" class="block text-sm font-medium text-gray-700 mb-2">База данных</label>
            <input 
              id="sql-database"
              v-model="form.server_info.database"
              type="text" 
              placeholder="myapp"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
        </div>

        <!-- Tables Information -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <div class="block text-sm font-medium text-gray-700">Информация о таблицах (опционально)</div>
            <button 
              type="button"
              @click="addTable"
              class="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Добавить таблицу
            </button>
          </div>
          <div v-if="form.tables && form.tables.length > 0" class="space-y-3">
            <div 
              v-for="(table, index) in form.tables" 
              :key="index"
              class="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <input 
                  v-model="table.name"
                  type="text" 
                  placeholder="Имя таблицы"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
              </div>
              <div>
                <input 
                  v-model="table.schema"
                  type="text" 
                  placeholder="Схема"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
              </div>
              <div>
                <input 
                  v-model.number="table.row_count"
                  type="number" 
                  placeholder="Кол-во строк"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
              </div>
              <div>
                <input 
                  :value="table.indexes.join(', ')"
                  type="text" 
                  placeholder="Индексы (через запятую)"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  @input="updateTableIndexes(index, ($event.target as HTMLInputElement)?.value || '')"
                >
              </div>
              <div>
                <button 
                  type="button"
                  @click="removeTable(index)"
                  class="w-full p-2 text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <svg class="w-5 h-5 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Query Plan -->
        <div>
          <label for="query-plan" class="block text-sm font-medium text-gray-700 mb-2">План выполнения (JSON, опционально)</label>
          <textarea 
            id="query-plan"
            v-model="queryPlanText"
            rows="4"
            placeholder='{"Plan": {"Node Type": "Sort", "Sort Key": ["order_count"], "Total Cost": 1234.56}}'
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          ></textarea>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button 
            type="submit"
            :disabled="loading || !canReview"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Анализируем...' : 'Анализировать запрос' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Results -->
    <div v-if="results" class="border-t border-gray-200">
      <SQLReviewResults :results="results" />
    </div>

    <!-- Error State -->
    <div v-if="error" class="border-t border-gray-200 p-6">
      <div class="bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex">
          <svg class="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 class="text-red-800 font-medium">Ошибка анализа</h4>
            <p class="text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { SQLReviewRequest, SQLReviewResult, Environment } from '~/types/api'

const api = useApi()

const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<SQLReviewResult | null>(null)
const queryPlanText = ref('')

const form = ref<SQLReviewRequest>({
  sql: '',
  environment: 'production' as Environment,
  server_info: {
    version: '15.4',
    host: 'localhost',
    database: 'myapp'
  },
  tables: [],
  thread_id: '',
  query_plan: undefined
})

const canReview = computed(() => {
  return form.value.sql.trim().length > 0 && 
         form.value.server_info.version && 
         form.value.server_info.host && 
         form.value.server_info.database
})

// Watch for query plan text changes and parse JSON
watch(queryPlanText, (newValue) => {
  if (newValue.trim()) {
    try {
      form.value.query_plan = JSON.parse(newValue)
    } catch {
      // Invalid JSON, set to undefined
      form.value.query_plan = undefined
    }
  } else {
    form.value.query_plan = undefined
  }
})

const addTable = () => {
  if (!form.value.tables) {
    form.value.tables = []
  }
  form.value.tables.push({
    name: '',
    schema: 'public',
    row_count: 0,
    indexes: []
  })
}

const removeTable = (index: number) => {
  if (form.value.tables) {
    form.value.tables.splice(index, 1)
  }
}

const updateTableIndexes = (index: number, value: string) => {
  if (form.value.tables && form.value.tables[index]) {
    form.value.tables[index].indexes = value.split(',').map(s => s.trim()).filter(s => s.length > 0)
  }
}

const reviewSQL = async () => {
  if (!canReview.value) return
  
  loading.value = true
  error.value = null
  results.value = null

  try {
    // Clean up form data
    const requestData = { ...form.value }
    if (!requestData.thread_id) {
      delete requestData.thread_id
    }
    if (!requestData.tables || requestData.tables.length === 0) {
      delete requestData.tables
    }

    results.value = await api.reviewSQL(requestData)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Произошла ошибка при анализе SQL запроса'
  } finally {
    loading.value = false
  }
}
</script>
