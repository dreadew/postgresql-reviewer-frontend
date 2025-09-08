import { defineStore } from 'pinia'
import type { 
  ReviewRequest, 
  ReviewResponse,
  LogsAnalyzeRequest,
  LogsAnalyzeResponse,
  ConfigAnalyzeRequest,
  ConfigAnalyzeResponse,
  MonitoringTaskExecution,
  MonitoringStats
} from '~/types/api'

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    reviewHistory: [] as (ReviewRequest & { response: ReviewResponse; timestamp: string })[],
    logsAnalyses: [] as (LogsAnalyzeRequest & { response: LogsAnalyzeResponse; timestamp: string })[],
    configAnalyses: [] as (ConfigAnalyzeRequest & { response: ConfigAnalyzeResponse; timestamp: string })[],
    loading: false,
    error: null as string | null,
  }),

  actions: {
    // Review API
    async reviewSQL(request: ReviewRequest) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response = await api.reviewSQL(request)
        
        // Store in history
        this.reviewHistory.unshift({
          ...request,
          response,
          timestamp: new Date().toISOString()
        })
        
        // Keep only last 50 reviews
        if (this.reviewHistory.length > 50) {
          this.reviewHistory = this.reviewHistory.slice(0, 50)
        }
        
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to review SQL'
        console.error('Error reviewing SQL:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async reviewBatch(requests: ReviewRequest[]) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const responses = await api.reviewBatch(requests)
        
        // Store each in history
        responses.forEach((response, index) => {
          const request = requests[index]
          if (request) {
            this.reviewHistory.unshift({
              ...request,
              response,
              timestamp: new Date().toISOString()
            })
          }
        })
        
        // Keep only last 50 reviews
        if (this.reviewHistory.length > 50) {
          this.reviewHistory = this.reviewHistory.slice(0, 50)
        }
        
        return responses
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to review SQL batch'
        console.error('Error reviewing SQL batch:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Logs API
    async analyzeLogs(request: LogsAnalyzeRequest) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response = await api.analyzeLogs(request)
        
        // Store in history
        this.logsAnalyses.unshift({
          ...request,
          response,
          timestamp: new Date().toISOString()
        })
        
        // Keep only last 20 analyses
        if (this.logsAnalyses.length > 20) {
          this.logsAnalyses = this.logsAnalyses.slice(0, 20)
        }
        
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to analyze logs'
        console.error('Error analyzing logs:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Config API
    async analyzeConfig(request: ConfigAnalyzeRequest) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        const response = await api.analyzeConfig(request)
        
        // Store in history
        this.configAnalyses.unshift({
          ...request,
          response,
          timestamp: new Date().toISOString()
        })
        
        // Keep only last 20 analyses
        if (this.configAnalyses.length > 20) {
          this.configAnalyses = this.configAnalyses.slice(0, 20)
        }
        
        return response
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to analyze config'
        console.error('Error analyzing config:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    },

    clearHistory() {
      this.reviewHistory = []
      this.logsAnalyses = []
      this.configAnalyses = []
    }
  },

  getters: {
    latestReview: (state) => state.reviewHistory[0] || null,
    latestLogsAnalysis: (state) => state.logsAnalyses[0] || null,
    latestConfigAnalysis: (state) => state.configAnalyses[0] || null,
    
    // Review statistics
    reviewStats: (state) => {
      if (state.reviewHistory.length === 0) return null
      
      const grades = state.reviewHistory.map(r => r.response.grade)
      const gradeCount = grades.reduce((acc, grade) => {
        acc[grade] = (acc[grade] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const averageScore = state.reviewHistory.reduce((sum, r) => sum + r.response.overall_score, 0) / state.reviewHistory.length
      
      return {
        totalReviews: state.reviewHistory.length,
        averageScore: Math.round(averageScore * 10) / 10,
        gradeDistribution: gradeCount
      }
    }
  }
})

export const useMonitoringStore = defineStore('monitoring', {
  state: () => ({
    taskExecutions: [] as MonitoringTaskExecution[],
    stats: null as MonitoringStats | null,
    systemHealth: null as { status: string; details: any } | null,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async fetchTaskExecutions(taskId?: number, limit?: number) {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        this.taskExecutions = await api.getMonitoringTaskExecutions(taskId, limit)
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch task executions'
        console.error('Error fetching task executions:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchStats() {
      this.loading = true
      this.error = null
      
      try {
        const api = useApi()
        this.stats = await api.getMonitoringStats()
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'Failed to fetch monitoring stats'
        console.error('Error fetching monitoring stats:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchSystemHealth() {
      try {
        const api = useApi()
        this.systemHealth = await api.getSystemHealth()
        return this.systemHealth
      } catch (error) {
        console.error('Error fetching system health:', error)
        throw error
      }
    },

    clearError() {
      this.error = null
    }
  },

  getters: {
    recentExecutions: (state) => [...state.taskExecutions]
      .sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
      .slice(0, 10),
    
    executionStats: (state) => {
      if (state.taskExecutions.length === 0) return null
      
      const statusCount = state.taskExecutions.reduce((acc, execution) => {
        acc[execution.status] = (acc[execution.status] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      return {
        total: state.taskExecutions.length,
        byStatus: statusCount,
        successRate: Math.round((statusCount.completed || 0) / state.taskExecutions.length * 100)
      }
    }
  }
})
