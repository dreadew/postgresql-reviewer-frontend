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

        <!-- Environment -->
        <div>
          <label for="sql-environment" class="block text-sm font-medium text-gray-700 mb-2">Среда</label>
          <select 
            id="sql-environment"
            v-model="environment" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="dev">Development</option>
            <option value="test">Testing</option>
            <option value="stage">Staging</option>
            <option value="prod">Production</option>
          </select>
        </div>

        <!-- Query Plan -->
        <div>
          <label for="query-plan" class="block text-sm font-medium text-gray-700 mb-2">План выполнения (EXPLAIN, опционально)</label>
          <textarea 
            id="query-plan"
            v-model="queryPlanText"
            rows="6"
            placeholder='{"Plan": {"Node Type": "Sort", "Sort Key": ["order_count"], "Total Cost": 1234.56}}'
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">Формат: JSON результат команды EXPLAIN (FORMAT JSON)</p>
        </div>

        <!-- Tables Information -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <label class="block text-sm font-medium text-gray-700">Информация о таблицах (опционально)</label>
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
              <input 
                v-model="table.name"
                placeholder="Имя таблицы" 
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
              <input 
                v-model="table.schema"
                placeholder="Схема" 
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
              <input 
                v-model.number="table.row_count"
                placeholder="Кол-во строк" 
                type="number"
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
              <input 
                v-model="table.indexes"
                placeholder="Индексы (через запятую)" 
                class="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
              <button 
                type="button"
                @click="removeTable(index)"
                class="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>

        <!-- Submit -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="!canReview || loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {{ loading ? 'Анализируем...' : '🔍 Проанализировать SQL' }}
          </button>
        </div>
      </form>

      <!-- Error -->
      <div v-if="error" class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <div class="flex items-start">
          <svg class="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
          <div>
            <h4 class="text-red-800 font-medium">Ошибка анализа</h4>
            <p class="text-red-700 mt-1">{{ error }}</p>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div v-if="results" class="mt-6">
        <SQLReviewResults :results="results" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ReviewRequest, ReviewResponse } from '~/types/api'

const analysisStore = useAnalysisStore()

const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<ReviewResponse | null>(null)
const queryPlanText = ref('')
const environment = ref<'dev' | 'test' | 'stage' | 'prod'>('prod')

const form = ref<ReviewRequest>({
  sql: '',
  query_plan: undefined,
  tables: [],
  database_stats: undefined
})

const canReview = computed(() => {
  return form.value.sql.trim().length > 0
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

const reviewSQL = async () => {
  if (!canReview.value) return
  
  loading.value = true
  error.value = null
  results.value = null

  try {
    // Подготавливаем данные для запроса
    const requestData: ReviewRequest = {
      sql: form.value.sql,
      query_plan: form.value.query_plan,
      tables: form.value.tables || [], // Всегда передаем массив, даже если пустой
      database_stats: form.value.database_stats
    }

    // Парсим query_plan из текста если он есть
    if (queryPlanText.value.trim()) {
      try {
        requestData.query_plan = JSON.parse(queryPlanText.value)
      } catch {
        // Игнорируем ошибки парсинга JSON
        requestData.query_plan = undefined
      }
    }

    // Обрабатываем индексы для таблиц
    if (requestData.tables) {
      requestData.tables.forEach(table => {
        if (typeof table.indexes === 'string') {
          table.indexes = (table.indexes as any).split(',').map((idx: string) => idx.trim()).filter((idx: string) => idx.length > 0)
        }
      })
    }

    results.value = await analysisStore.reviewSQL(requestData)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Произошла ошибка при анализе SQL запроса'
  } finally {
    loading.value = false
  }
}
</script>
