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
            placeholder="2024-01-01 10:00:00 UTC LOG: connection received: host=192.168.1.100 port=54321
2024-01-01 10:00:01 UTC ERROR: password authentication failed for user &quot;admin&quot;
2024-01-01 10:00:05 UTC LOG: connection authorized: user=myuser database=mydb
2024-01-01 10:00:10 UTC WARNING: could not acquire lock on relation &quot;users&quot;"
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
        <div>
          <label for="logs-environment" class="block text-sm font-medium text-gray-700 mb-2">Среда</label>
          <select 
            id="logs-environment"
            v-model="environment" 
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="development">Development</option>
            <option value="staging">Staging</option>
            <option value="production">Production</option>
            <option value="testing">Testing</option>
          </select>
        </div>

        <!-- Server Info -->
        <div>
          <label for="server-info" class="block text-sm font-medium text-gray-700 mb-2">Информация о сервере</label>
          <textarea 
            id="server-info"
            v-model="serverInfoText"
            rows="4"
            placeholder='{
  "version": "15.2",
  "host": "localhost", 
  "port": "5432"
}'
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
          ></textarea>
          <p class="text-xs text-gray-500 mt-1">Формат: JSON объект с информацией о сервере</p>
        </div>

        <!-- Submit -->
        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="!canAnalyze || loading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
          >
            {{ loading ? 'Анализируем...' : '🔍 Проанализировать логи' }}
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
        <LogAnalysisResults :results="results" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { LogsAnalyzeRequest, LogsAnalyzeResponse, Environment } from '~/types/api'

const analysisStore = useAnalysisStore()

const loading = ref(false)
const error = ref<string | null>(null)
const results = ref<LogsAnalyzeResponse | null>(null)
const environment = ref<Environment>('production')
const serverInfoText = ref('')

const form = ref<LogsAnalyzeRequest>({
  logs: '',
  server_info: {
    version: '',
    host: '',
    database: ''
  },
  environment: 'production'
})

const canAnalyze = computed(() => {
  return form.value.logs.trim().length > 0
})

const loadSampleLogs = () => {
  form.value.logs = `2024-01-01 10:00:00 UTC LOG: connection received: host=192.168.1.100 port=54321
2024-01-01 10:00:01 UTC ERROR: password authentication failed for user "admin"
2024-01-01 10:00:05 UTC LOG: connection authorized: user=myuser database=mydb
2024-01-01 10:00:10 UTC WARNING: could not acquire lock on relation "users"
2024-01-01 10:00:15 UTC LOG: duration: 1500.234 ms statement: SELECT * FROM large_table WHERE complex_condition = 'slow_query'
2024-01-01 10:00:20 UTC ERROR: duplicate key value violates unique constraint "users_email_key"
2024-01-01 10:00:25 UTC FATAL: password authentication failed for user "hacker"
2024-01-01 10:00:30 UTC LOG: checkpoint starting: time
2024-01-01 10:00:35 UTC WARNING: could not receive data from client: Connection reset by peer
2024-01-01 10:00:40 UTC LOG: checkpoint complete: wrote 256 buffers (1.6%); 0 WAL file(s) added, 0 removed, 1 recycled`

  // Также загружаем пример server_info
  serverInfoText.value = JSON.stringify({
    version: "15.2",
    host: "localhost",
    port: "5432"
  }, null, 2)
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
    // Парсим server_info из текста или используем пустой объект
    let server_info: any = {}
    if (serverInfoText.value.trim()) {
      try {
        server_info = JSON.parse(serverInfoText.value)
      } catch {
        throw new Error('Некорректный JSON в поле информации о сервере')
      }
    }

    const request: LogsAnalyzeRequest = {
      logs: form.value.logs,
      server_info,
      environment: environment.value
    }

    results.value = await analysisStore.analyzeLogs(request)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Произошла ошибка при анализе логов'
  } finally {
    loading.value = false
  }
}
</script>
