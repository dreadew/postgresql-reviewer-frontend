<template>
  <teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <!-- Background overlay -->
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          @click="$emit('close')"
        ></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div class="flex justify-between items-center mb-4">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    Просмотр правила: {{ rule?.title }}
                  </h3>
                  <span
                    :class="[
                      'status-badge',
                      rule?.category === 'config' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    ]"
                  >
                    {{ getCategoryLabel(rule?.category || '') }}
                  </span>
                </div>
                
                <!-- Rule metadata -->
                <div class="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span class="font-medium text-gray-700">Файл:</span>
                      <span class="ml-2 text-gray-900">{{ rule?.filename }}</span>
                    </div>
                    <div>
                      <span class="font-medium text-gray-700">Категория:</span>
                      <span class="ml-2 text-gray-900">{{ getCategoryLabel(rule?.category || '') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Rule content -->
                <div class="prose max-w-none">
                  <div class="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
                    <pre class="whitespace-pre-wrap text-sm text-gray-800">{{ rule?.content }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="$emit('close')"
              class="btn btn-secondary btn-md w-full sm:w-auto"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { Rule } from '~/types/api'

interface Props {
  isOpen: boolean
  rule?: Rule | null
}

interface Emits {
  (e: 'close'): void
}

defineProps<Props>()
defineEmits<Emits>()

const getCategoryLabel = (category: string): string => {
  const labels: Record<string, string> = {
    'config': 'Конфигурация',
    'sql': 'SQL запросы'
  }
  return labels[category] || category
}
</script>
