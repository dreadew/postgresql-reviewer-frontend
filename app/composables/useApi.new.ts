import type { 
  DatabaseConnection, 
  CreateConnectionRequest,
  Task,
  CreateTaskRequest,
  ScheduledTask,
  CreateScheduledTaskRequest,
  TaskExecution,
  Rule,
  CreateRuleRequest,
  ReviewRequest,
  ReviewResponse,
  LogsAnalyzeRequest,
  LogsAnalyzeResponse,
  ConfigAnalyzeRequest,
  ConfigAnalyzeResponse,
  MonitoringTaskExecution,
  MonitoringStats
} from '~/types/api'

class ApiClient {
  private readonly baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`
        }))
        throw new Error(errorData.detail || 'API request failed')
      }

      // Handle empty responses
      const text = await response.text()
      if (!text) return {} as T
      
      return JSON.parse(text) as T
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Unknown error occurred')
    }
  }

  // Connections API
  async getConnections(): Promise<DatabaseConnection[]> {
    return this.makeRequest<DatabaseConnection[]>('/connections/')
  }

  async createConnection(connection: CreateConnectionRequest): Promise<DatabaseConnection> {
    return this.makeRequest<DatabaseConnection>('/connections/', {
      method: 'POST',
      body: JSON.stringify(connection),
    })
  }

  async updateConnection(id: number, connection: Partial<CreateConnectionRequest>): Promise<DatabaseConnection> {
    return this.makeRequest<DatabaseConnection>(`/connections/${id}`, {
      method: 'PUT',
      body: JSON.stringify(connection),
    })
  }

  async deleteConnection(id: number): Promise<void> {
    return this.makeRequest<void>(`/connections/${id}`, {
      method: 'DELETE',
    })
  }

  async testConnection(id: number): Promise<{ success: boolean; message: string }> {
    return this.makeRequest<{ success: boolean; message: string }>(`/connections/${id}/test`, {
      method: 'POST',
    })
  }

  // Scheduler API (заменяет старый Tasks API)
  async getScheduledTasks(): Promise<ScheduledTask[]> {
    return this.makeRequest<ScheduledTask[]>('/scheduler/tasks')
  }

  async getScheduledTask(id: number): Promise<ScheduledTask> {
    return this.makeRequest<ScheduledTask>(`/scheduler/tasks/${id}`)
  }

  async createScheduledTask(task: CreateScheduledTaskRequest): Promise<ScheduledTask> {
    return this.makeRequest<ScheduledTask>('/scheduler/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    })
  }

  async updateScheduledTask(id: number, task: Partial<CreateScheduledTaskRequest>): Promise<ScheduledTask> {
    return this.makeRequest<ScheduledTask>(`/scheduler/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    })
  }

  async deleteScheduledTask(taskId: number): Promise<void> {
    return this.makeRequest<void>(`/scheduler/tasks/${taskId}`, {
      method: 'DELETE',
    })
  }

  async pauseScheduledTask(taskId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/scheduler/tasks/${taskId}/pause`, {
      method: 'POST',
    })
  }

  async resumeScheduledTask(taskId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/scheduler/tasks/${taskId}/resume`, {
      method: 'POST',
    })
  }

  async triggerScheduledTask(taskId: number): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>(`/scheduler/tasks/${taskId}/execute`, {
      method: 'POST',
    })
  }

  async getSchedulerStats(): Promise<any> {
    return this.makeRequest<any>('/scheduler/stats')
  }

  async getQueueStatus(): Promise<any> {
    return this.makeRequest<any>('/scheduler/queue')
  }

  async getTaskExecutions(taskId?: number, limit?: number): Promise<TaskExecution[]> {
    const params = new URLSearchParams()
    if (taskId) params.append('task_id', taskId.toString())
    if (limit) params.append('limit', limit.toString())
    const query = params.toString()
    
    return this.makeRequest<TaskExecution[]>(`/scheduler/executions${query ? '?' + query : ''}`)
  }

  // Rules API
  async getRules(category?: 'config' | 'sql'): Promise<Rule[]> {
    const params = category ? `?category=${category}` : ''
    return this.makeRequest<Rule[]>(`/rules/${params}`)
  }

  async getRule(category: 'config' | 'sql', filename: string): Promise<Rule> {
    return this.makeRequest<Rule>(`/rules/${category}/${filename}`)
  }

  async createRule(rule: CreateRuleRequest): Promise<Rule> {
    return this.makeRequest<Rule>('/rules/', {
      method: 'POST',
      body: JSON.stringify(rule),
    })
  }

  async updateRule(category: 'config' | 'sql', filename: string, rule: Partial<CreateRuleRequest>): Promise<Rule> {
    return this.makeRequest<Rule>(`/rules/${category}/${filename}`, {
      method: 'PUT',
      body: JSON.stringify(rule),
    })
  }

  async deleteRule(category: 'config' | 'sql', filename: string): Promise<void> {
    return this.makeRequest<void>(`/rules/${category}/${filename}`, {
      method: 'DELETE',
    })
  }

  async ingestRules(rules_dir: string): Promise<{ message: string }> {
    return this.makeRequest<{ message: string }>('/rules/ingest', {
      method: 'POST',
      body: JSON.stringify({ rules_dir }),
    })
  }

  // Review API (новый)
  async reviewSQL(request: ReviewRequest): Promise<ReviewResponse> {
    return this.makeRequest<ReviewResponse>('/review/', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async reviewBatch(requests: ReviewRequest[]): Promise<ReviewResponse[]> {
    return this.makeRequest<ReviewResponse[]>('/review/batch', {
      method: 'POST',
      body: JSON.stringify({ queries: requests }),
    })
  }

  // Logs API (новый)
  async analyzeLogs(request: LogsAnalyzeRequest): Promise<LogsAnalyzeResponse> {
    return this.makeRequest<LogsAnalyzeResponse>('/logs/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Config API (новый)
  async analyzeConfig(request: ConfigAnalyzeRequest): Promise<ConfigAnalyzeResponse> {
    return this.makeRequest<ConfigAnalyzeResponse>('/config/analyze', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  // Monitoring API (новый)
  async getMonitoringTaskExecutions(taskId?: number, limit?: number): Promise<MonitoringTaskExecution[]> {
    const params = new URLSearchParams()
    if (taskId) params.append('task_id', taskId.toString())
    if (limit) params.append('limit', limit.toString())
    const query = params.toString()
    
    return this.makeRequest<MonitoringTaskExecution[]>(`/monitoring/tasks/executions${query ? '?' + query : ''}`)
  }

  async getMonitoringStats(): Promise<MonitoringStats> {
    return this.makeRequest<MonitoringStats>('/monitoring/stats')
  }

  async getSystemHealth(): Promise<{ status: string; details: any }> {
    return this.makeRequest<{ status: string; details: any }>('/monitoring/health')
  }

  // Legacy Tasks API (deprecated, удалить после миграции)
  async getTasks(): Promise<Task[]> {
    console.warn('getTasks() is deprecated, use getScheduledTasks() instead')
    return this.makeRequest<Task[]>('/tasks/')
  }

  async createTask(task: CreateTaskRequest): Promise<Task> {
    console.warn('createTask() is deprecated, use createScheduledTask() instead')
    return this.makeRequest<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(task),
    })
  }

  async updateTask(id: number, task: Partial<CreateTaskRequest>): Promise<Task> {
    console.warn('updateTask() is deprecated, use updateScheduledTask() instead')
    return this.makeRequest<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(task),
    })
  }

  async deleteTask(id: number): Promise<void> {
    console.warn('deleteTask() is deprecated, use deleteScheduledTask() instead')
    return this.makeRequest<void>(`/tasks/${id}`, {
      method: 'DELETE',
    })
  }

  async runTask(id: number): Promise<{ message: string }> {
    console.warn('runTask() is deprecated, use triggerScheduledTask() instead')
    return this.makeRequest<{ message: string }>(`/tasks/${id}/execute`, {
      method: 'POST',
    })
  }
}

const apiClient = new ApiClient(
  process.env.NODE_ENV === 'production' 
    ? 'https://api.postgresql-reviewer.com/api/v1' 
    : 'http://localhost:8000/api/v1'
)

export const useApi = () => apiClient
