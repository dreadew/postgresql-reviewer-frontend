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
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form @submit.prevent="onSubmit">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4" id="modal-title">
                    {{ isEditing ? 'Редактировать правило' : 'Создать правило' }}
                  </h3>
                  
                  <!-- Form fields -->
                  <div class="space-y-4">
                    <div>
                      <label for="rule-category" class="label">Категория</label>
                      <select
                        id="rule-category"
                        v-model="form.category"
                        class="input"
                        required
                        :disabled="isEditing"
                      >
                        <option value="">Выберите категорию</option>
                        <option value="config">Конфигурация</option>
                        <option value="sql">SQL запросы</option>
                        <option value="logs">Анализ логов</option>
                      </select>
                    </div>

                    <div>
                      <label for="rule-filename" class="label">Имя файла</label>
                      <input
                        id="rule-filename"
                        v-model="form.filename"
                        type="text"
                        class="input"
                        required
                        :disabled="isEditing"
                        placeholder="rule_name.md"
                      />
                      <p class="mt-1 text-sm text-gray-500">
                        Файл должен иметь расширение .md
                      </p>
                    </div>

                    <div>
                      <label for="rule-title" class="label">Заголовок</label>
                      <input
                        id="rule-title"
                        v-model="form.title"
                        type="text"
                        class="input"
                        required
                        placeholder="Название правила"
                      />
                    </div>

                    <div>
                      <label for="rule-content" class="label">Содержимое</label>
                      <textarea
                        id="rule-content"
                        v-model="form.content"
                        class="input"
                        rows="10"
                        required
                        placeholder="Markdown содержимое правила..."
                      ></textarea>
                      <p class="mt-1 text-sm text-gray-500">
                        Поддерживается Markdown разметка
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Action buttons -->
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                :disabled="loading"
                class="btn btn-primary btn-md w-full sm:ml-3 sm:w-auto"
              >
                {{ loading ? 'Сохранение...' : 'Сохранить' }}
              </button>
              <button
                type="button"
                @click="$emit('close')"
                class="btn btn-secondary btn-md mt-3 w-full sm:mt-0 sm:w-auto"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup lang="ts">
import type { Rule, CreateRuleRequest } from '~/types/api'

interface Props {
  isOpen: boolean
  rule?: Rule | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const rulesStore = useRulesStore()

// Computed
const isEditing = computed(() => !!props.rule && !!props.rule.content)

// Reactive state
const loading = ref(false)
const form = reactive<CreateRuleRequest>({
  category: 'config',
  filename: '',
  title: '',
  content: ''
})

// Watch for rule changes to populate form
watch(() => props.rule, async (rule) => {
  if (rule) {
    form.category = rule.category
    form.filename = rule.filename
    form.title = rule.title
    
    // If editing and content is not loaded, fetch it
    if (rule.content) {
      form.content = rule.content
    } else {
      try {
        const fullRule = await rulesStore.getRule(rule.category, rule.filename)
        form.content = fullRule.content || ''
      } catch (error) {
        console.error('Error loading rule content:', error)
        form.content = ''
      }
    }
  } else {
    // Reset form for new rule
    Object.assign(form, {
      category: 'config',
      filename: '',
      title: '',
      content: ''
    })
  }
}, { immediate: true })

// Auto-generate filename from title
watch(() => form.title, (title) => {
  if (title && !isEditing.value) {
    const sanitized = title
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '_')
    form.filename = `${sanitized}.md`
  }
})

// Methods
const onSubmit = async () => {
  loading.value = true
  
  try {
    if (isEditing.value && props.rule) {
      // Update existing rule - передаём только title и content
      const updateData = {
        title: form.title,
        content: form.content
      }
      await rulesStore.updateRule(props.rule.category, props.rule.filename, updateData)
    } else {
      // Create new rule - передаём все поля
      await rulesStore.createRule(form)
    }
    
    emit('saved')
  } catch (error) {
    console.error('Error saving rule:', error)
  } finally {
    loading.value = false
  }
}
</script>
