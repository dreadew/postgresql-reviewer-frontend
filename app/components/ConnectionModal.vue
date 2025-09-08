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
                    {{ isEditing ? 'Редактировать подключение' : 'Создать подключение' }}
                  </h3>
                  
                  <!-- Form fields -->
                  <div class="space-y-6">
                    <div class="form-group">
                      <label class="label">Название</label>
                      <input
                        v-model="form.name"
                        type="text"
                        class="input"
                        required
                        placeholder="Введите название подключения"
                      />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="form-group">
                        <label for="host" class="label">Хост</label>
                        <input
                          id="host"
                          v-model="form.host"
                          type="text"
                          class="input"
                          required
                          placeholder="localhost"
                        />
                      </div>

                      <div class="form-group">
                        <label for="port" class="label">Порт</label>
                        <input
                          id="port"
                          v-model.number="form.port"
                          type="number"
                          class="input"
                          required
                          placeholder="5432"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="database" class="label">База данных</label>
                      <input
                        id="database"
                        v-model="form.database"
                        type="text"
                        class="input"
                        required
                        placeholder="Название базы данных"
                      />
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div class="form-group">
                        <label for="username" class="label">Пользователь</label>
                        <input
                          id="username"
                          v-model="form.username"
                          type="text"
                          class="input"
                          required
                          placeholder="Имя пользователя"
                        />
                      </div>

                      <div class="form-group">
                        <label for="password" class="label">Пароль</label>
                        <input
                          id="password"
                          v-model="form.password"
                          type="password"
                          class="input"
                          :required="!isEditing"
                          :placeholder="isEditing ? 'Оставьте пустым для сохранения текущего' : 'Введите пароль'"
                        />
                      </div>
                    </div>

                    <div class="form-group">
                      <label for="vault-path" class="label">Vault Path</label>
                      <input
                        id="vault-path"
                        v-model="form.vault_path"
                        type="text"
                        class="input"
                        placeholder="/database/creds/connection-name"
                      />
                      <p class="help-text">
                        Путь для хранения credentials в Vault
                      </p>
                    </div>

                    <div class="form-group">
                      <label for="environment" class="label">Окружение</label>
                      <select
                        id="environment"
                        v-model="form.environment"
                        class="input"
                        required
                      >
                        <option value="">Выберите окружение</option>
                        <option value="development">Development</option>
                        <option value="staging">Staging</option>
                        <option value="production">Production</option>
                        <option value="testing">Testing</option>
                      </select>
                    </div>

                    <div class="form-group">
                      <label for="description" class="label">Описание</label>
                      <textarea
                        id="description"
                        v-model="form.description"
                        class="input"
                        rows="3"
                        placeholder="Описание подключения (необязательно)"
                      ></textarea>
                    </div>

                    <div class="form-group">
                      <label for="tags" class="label">Теги</label>
                      <input
                        id="tags"
                        v-model="tagsInput"
                        type="text"
                        class="input"
                        placeholder="postgres, production, main (через запятую)"
                      />
                      <p class="help-text">
                        Теги через запятую для группировки подключений
                      </p>
                      <div v-if="form.tags && form.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
                        <span 
                          v-for="tag in form.tags" 
                          :key="tag"
                          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {{ tag }}
                          <button
                            type="button"
                            @click="removeTag(tag)"
                            class="ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-500 focus:outline-none focus:bg-blue-500 focus:text-white"
                          >
                            <span class="sr-only">Remove tag</span>
                            <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                              <path stroke-linecap="round" stroke-width="1.5" d="m1 1 6 6m0-6-6 6" />
                            </svg>
                          </button>
                        </span>
                      </div>
                    </div>

                    <div class="flex items-center space-x-3 pt-2">
                      <input
                        id="is-active"
                        v-model="form.is_active"
                        type="checkbox"
                        class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                      />
                      <label for="is-active" class="text-sm font-medium text-gray-700">
                        Активное подключение
                      </label>
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
import type { DatabaseConnection, CreateConnectionRequest } from '~/types/api'

interface Props {
  isOpen: boolean
  connection?: DatabaseConnection | null
}

interface Emits {
  (e: 'close'): void
  (e: 'saved'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const connectionsStore = useConnectionsStore()

// Computed
const isEditing = computed(() => !!props.connection)

// Reactive state
const loading = ref(false)
const tagsInput = ref('')
const form = reactive<CreateConnectionRequest>({
  name: '',
  host: '',
  port: 5432,
  database: '',
  username: '',
  password: '',
  vault_path: '',
  environment: 'development',
  description: '',
  tags: [],
  is_active: true
})

// Watch for connection changes to populate form
watch(() => props.connection, (connection) => {
  if (connection) {
    form.name = connection.name
    form.host = connection.host
    form.port = connection.port
    form.database = connection.database
    form.username = connection.username
    form.password = ''
    form.vault_path = connection.vault_path
    form.environment = connection.environment
    form.description = connection.description || ''
    form.tags = connection.tags || []
    form.is_active = connection.is_active
    tagsInput.value = form.tags.join(', ')
  } else {
    // Reset form for new connection
    Object.assign(form, {
      name: '',
      host: '',
      port: 5432,
      database: '',
      username: '',
      password: '',
      vault_path: '',
      environment: 'development',
      description: '',
      tags: [],
      is_active: true
    })
    tagsInput.value = ''
  }
}, { immediate: true })

// Watch tags input to update form.tags
watch(tagsInput, (value) => {
  form.tags = value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
})

// Auto-generate vault path based on name
watch(() => form.name, (name) => {
  if (name && !isEditing.value) {
    form.vault_path = `/database/creds/${name.toLowerCase().replace(/\s+/g, '-')}`
  }
})

// Methods
const removeTag = (tagToRemove: string) => {
  form.tags = form.tags?.filter(tag => tag !== tagToRemove) || []
  tagsInput.value = form.tags.join(', ')
}

// Methods
const onSubmit = async () => {
  loading.value = true
  
  try {
    if (isEditing.value && props.connection) {
      // Update existing connection
      const updateData: Partial<CreateConnectionRequest> = { ...form }
      if (!updateData.password) {
        delete updateData.password
      }
      await connectionsStore.updateConnection(props.connection.id, updateData)
    } else {
      // Create new connection
      await connectionsStore.createConnection(form)
    }
    
    emit('saved')
  } catch (error) {
    console.error('Error saving connection:', error)
  } finally {
    loading.value = false
  }
}
</script>
