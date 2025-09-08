<template>
  <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
    <!-- Header -->
    <div class="border-b border-gray-200 px-6 py-4">
      <h3 class="text-lg font-semibold text-gray-900">Анализ логов PostgreSQL</h3>
      <p class="text-sm text-gray-600 mt-1">Проанализируйте логи сервера для выявления ошибок и проблем производительности</p>
    </div>

    <!-- Form -->
    <div class="p-6">
      <form @submit.prevent="analyzeLogs" class="space-y-6">
        <!-- Log Content -->
        <div>
          <label for="logs" class="block text-sm font-medium text-gray-700 mb-2">Содержимое логов</label>
          <textarea 
            id="logs"
            v-model="form.logs"
            rows="12"
            placeholder="2024-01-01 12:00:01.123 UTC [12345] LOG: database system is ready to accept connections
2024-01-01 12:00:05.456 UTC [12346] ERROR: relation &quot;missing_table&quot; does not exist at character 15
2024-01-01 12:00:10.789 UTC [12347] WARNING: there is no transaction in progress
2024-01-01 12:01:15.234 UTC [12348] LOG: duration: 15234.567 ms statement: SELECT * FROM large_table WHERE complex_condition = 'slow_query'"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          ></textarea>
          <div class="mt-2 flex items-center space-x-4">
            <button 
              type="button"
              @click="loadSampleLogs"
              class="text-sm text-blue-600 hover:text-blue-700"
            >
              Загрузить пример логов
            </button>
            <input 
              type="file"
              accept=".log,.txt"
              @change="handleFileUpload"
              class="text-sm text-gray-600"
            >
          </div>
        </div>

        <!-- Environment -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="logs-environment" class="block text-sm font-medium text-gray-700 mb-2">Среда</label>
            <select 
              id="logs-environment"
              v-model="form.environment" 
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="development">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
              <option value="testing">Testing</option>
            </select>
          </div>
        </div>

        <!-- Server Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label for="logs-version" class="block text-sm font-medium text-gray-700 mb-2">Версия PostgreSQL</label>
            <input 
              id="logs-version"
              v-model="form.server_info.version"
              type="text" 
              placeholder="15.4"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <div>
            <label for="logs-host" class="block text-sm font-medium text-gray-700 mb-2">Хост</label>
            <input 
              id="logs-host"
              v-model="form.server_info.host"
              type="text" 
              placeholder="localhost"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
          <div>
            <label for="logs-database" class="block text-sm font-medium text-gray-700 mb-2">База данных</label>
            <input 
              id="logs-database"
              v-model="form.server_info.database"
              type="text" 
              placeholder="myapp"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button 
            type="submit"
            :disabled="loading || !canAnalyze"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{{ loading ? 'Анализируем...' : 'Анализировать логи' }}</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Results -->
    <div v-if="results" class="border-t border-gray-200">
      <LogAnalysisResults :results="results" />
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
import { ref, computed } from 'vue'
import type { LogAnalysisRequest, LogAnalysisResult, Environment } from '~/types/api'

const api = useApi()

const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<LogAnalysisResult | null>(null)

const form = ref<LogAnalysisRequest>({
  logs: '',
  environment: 'production' as Environment,
  server_info: {
    version: '15.4',
    host: 'localhost',
    database: 'myapp'
  }
})

const canAnalyze = computed(() => {
  return form.value.logs.trim().length > 0 && 
         form.value.server_info.version && 
         form.value.server_info.host && 
         form.value.server_info.database
})

const loadSampleLogs = () => {
  form.value.logs = `2024-01-01 12:00:01.123 UTC [12345] LOG: database system is ready to accept connections
2024-01-01 12:00:05.456 UTC [12346] ERROR: relation "missing_table" does not exist at character 15
2024-01-01 12:00:10.789 UTC [12347] WARNING: there is no transaction in progress
2024-01-01 12:01:15.234 UTC [12348] LOG: duration: 15234.567 ms statement: SELECT * FROM large_table WHERE complex_condition = 'slow_query'
2024-01-01 12:02:30.567 UTC [12349] LOG: checkpoint starting: time
2024-01-01 12:02:35.678 UTC [12350] ERROR: duplicate key value violates unique constraint "users_email_key"
2024-01-01 12:03:45.890 UTC [12351] LOG: duration: 2345.123 ms statement: UPDATE users SET last_login = NOW() WHERE id = 12345
2024-01-01 12:04:12.345 UTC [12352] FATAL: password authentication failed for user "hacker"
2024-01-01 12:05:23.456 UTC [12353] LOG: checkpoint complete: wrote 256 buffers (1.6%); 0 WAL file(s) added, 0 removed, 1 recycled
2024-01-01 12:06:34.567 UTC [12354] WARNING: could not receive data from client: Connection reset by peer`
}

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    const text = await file.text()
    form.value.logs = text
  } catch {
    error.value = 'Ошибка при чтении файла'
  }
}

const analyzeLogs = async () => {
  if (!canAnalyze.value) return
  
  loading.value = true
  error.value = null
  results.value = null

  try {
    results.value = await api.analyzeLogs(form.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Произошла ошибка при анализе логов'
  } finally {
    loading.value = false
  }
}
</script>
