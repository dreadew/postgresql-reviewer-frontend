import { defineStore } from 'pinia'
import type { 
  ReviewRequest, 
  ReviewResponse,
  SQLReviewResult,
  LogAnalysisResult,
  LogsAnalyzeRequest,
  ConfigAnalyzeRequest,
  ConfigAnalysisResult,
  MonitoringTaskExecution,
  MonitoringStats,
  Grade
} from '~/types/api'

/**
 * Normalize various backend shapes for config analysis into the frontend
 * ConfigAnalyzeResponse shape. Backend may return { errors, notes, overall_score }
 * or the richer { issues, recommendations, performance_score, ... } format.
 */
function normalizeConfigAnalyzeResponse(raw: any): ConfigAnalysisResult {
  const now = new Date().toISOString()

  const empty: ConfigAnalysisResult = {
    overall_score: 0,
    environment: 'production',
    timestamp: now,
    analysis_results: [],
    recommendations: [],
    summary: {
      total_parameters_analyzed: 0,
      high_priority_issues: 0,
      medium_priority_issues: 0,
      low_priority_issues: 0,
      configuration_grade: 'C'
    },
    server_info: { version: '', host: '', database: '' }
  }

  if (!raw) return empty

  const asArray = (v: any) => {
    if (Array.isArray(v)) return v
    if (v) return [v]
    return []
  }

  const computeGrade = (overall: number): Grade => {
    if (overall >= 80) return 'A'
    if (overall >= 60) return 'B'
    if (overall >= 40) return 'C'
    return 'D'
  }

  const mapIssue = (e: any) => {
    const sev = e.criticality || e.severity || 'low'
    const param = e.parameter || e.title || (typeof e.content === 'string' ? (e.content.split('\n')[0] || 'parameter') : 'parameter')
    let score = 0
    if (typeof e.score === 'number') score = e.score
    else if (sev === 'critical') score = 10
    else if (sev === 'high') score = 40
    else if (sev === 'medium') score = 70
    else score = 90

    return {
      category: e.category || 'config',
      parameter: param,
      current_value: e.current_value || '',
      recommended_value: e.recommended_value || '',
      severity: sev,
      score,
      description: e.content || e.message || e.description || '',
      impact: e.impact || 'low',
      recommendation: e.recommendation || e.remediation || ''
    }
  }

  const mapRecommendation = (r: any) => ({
    priority: r.priority || 'low',
    category: r.category || 'general',
    title: r.title || r.parameter || 'Recommendation',
    description: r.description || r.recommendation || String(r),
    sql_command: r.sql_command || ''
  })

  // Rich arrays
  if (Array.isArray(raw.issues) || Array.isArray(raw.recommendations)) {
    const issues = (raw.issues || []).map(mapIssue)
    const recs = (raw.recommendations || []).map(mapRecommendation)
    const overall = typeof raw.overall_score === 'number' ? raw.overall_score : 0
    const summary = {
      total_parameters_analyzed: issues.length,
      high_priority_issues: issues.filter((i: any) => i.severity === 'high' || i.severity === 'critical').length,
      medium_priority_issues: issues.filter((i: any) => i.severity === 'medium').length,
      low_priority_issues: issues.filter((i: any) => i.severity === 'low').length,
      configuration_grade: computeGrade(overall)
    }

    return {
      overall_score: overall,
      environment: raw.environment || 'production',
      timestamp: raw.timestamp || now,
      analysis_results: issues,
      recommendations: recs,
      summary,
      server_info: raw.server_info || { version: '', host: '', database: '' }
    }
  }

  // Single item shape
  if (raw && (raw.content || raw.criticality || raw.recommendation)) {
    const issue = mapIssue(raw)
    const recs = raw.recommendation ? [mapRecommendation({ description: raw.recommendation })] : []
    const overall = typeof raw.overall_score === 'number' ? raw.overall_score : (issue.score || 0)
    const summary = {
      total_parameters_analyzed: 1,
      high_priority_issues: issue.severity === 'high' || issue.severity === 'critical' ? 1 : 0,
      medium_priority_issues: issue.severity === 'medium' ? 1 : 0,
      low_priority_issues: issue.severity === 'low' ? 1 : 0,
      configuration_grade: computeGrade(overall)
    }

    return {
      overall_score: overall,
      environment: raw.environment || 'production',
      timestamp: raw.timestamp || now,
      analysis_results: [issue],
      recommendations: recs,
      summary,
      server_info: raw.server_info || { version: '', host: '', database: '' }
    }
  }

  // Fallback
  const synthesizedIssues = asArray(raw.errors || raw.issues || []).map(mapIssue)
  const synthesizedRecs = asArray(raw.notes || raw.recommendations || []).map(mapRecommendation)
  const overall = typeof raw.overall_score === 'number' ? raw.overall_score : 0
  const summary = {
    total_parameters_analyzed: synthesizedIssues.length,
    high_priority_issues: synthesizedIssues.filter((i: any) => i.severity === 'high' || i.severity === 'critical').length,
    medium_priority_issues: synthesizedIssues.filter((i: any) => i.severity === 'medium').length,
    low_priority_issues: synthesizedIssues.filter((i: any) => i.severity === 'low').length,
    configuration_grade: computeGrade(overall)
  }

  return {
    overall_score: overall,
    environment: raw.environment || 'production',
    timestamp: raw.timestamp || now,
    analysis_results: synthesizedIssues,
    recommendations: synthesizedRecs,
    summary,
    server_info: raw.server_info || { version: '', host: '', database: '' }
  }
}

function normalizeLogsAnalyzeResponse(raw: any): LogAnalysisResult {
  const now = new Date().toISOString()

  if (!raw) {
    return {
      errors: [],
      overall_score: 0,
      notes: '',
      analysis_summary: {
        total_log_lines: 0,
        error_count: 0,
        warning_count: 0,
        slow_query_count: 0,
        connection_events: 0,
        performance_issues: [],
        security_issues: [],
        connection_issues: [],
        categories: { errors: 0, warnings: 0, performance: 0, security: 0, connections: 0 },
        time_range: { start: now, end: now, duration_minutes: 0 },
        recommendations: []
      }
    }
  }

  const mapError = (e: any) => ({
    severity: e.severity || e.criticality || 'info',
    timestamp: e.timestamp || new Date().toISOString(),
    message: e.message || e.content || '',
    category: e.category || 'general',
    description: e.description || e.content || e.message || '',
    impact: e.impact || 'low',
    recommendation: e.recommendation || '',
    query: e.query,
    line_number: typeof e.line_number === 'number' ? e.line_number : 0
  })

  const sourceSummary = raw.analysis_summary || raw.summary || {}
  const mappedSummary = {
    total_log_lines: sourceSummary.total_log_lines || sourceSummary.total_lines || 0,
    error_count: sourceSummary.error_count || 0,
    warning_count: sourceSummary.warning_count || 0,
    slow_query_count: sourceSummary.slow_query_count || 0,
    connection_events: sourceSummary.connection_events || 0,
    performance_issues: sourceSummary.performance_issues || [],
    security_issues: sourceSummary.security_issues || [],
    connection_issues: sourceSummary.connection_issues || [],
    categories: sourceSummary.categories || { errors: 0, warnings: 0, performance: 0, security: 0, connections: 0 },
    time_range: {
      start: sourceSummary.time_range?.start || now,
      end: sourceSummary.time_range?.end || now,
      duration_minutes: sourceSummary.time_range?.duration_minutes || 0
    },
    recommendations: sourceSummary.recommendations || []
  }

  const errors = (Array.isArray(raw.errors) ? raw.errors : []).map(mapError)

  return {
    errors,
    overall_score: typeof raw.overall_score === 'number' ? raw.overall_score : 0,
    notes: raw.notes || raw.note || '',
    analysis_summary: mappedSummary
  }
}

/**
 * Normalize backend response for SQL review into frontend SQLReviewResult shape.
 * Backend may return a simple shape: { errors: [], overall_score, notes, thread_id }
 */
function normalizeSQLReviewResponse(raw: any): SQLReviewResult {
  const now = new Date().toISOString()

  const emptyQueryAnalysis = {
    complexity_score: 0,
    estimated_execution_time: 0,
    resource_usage: '',
    optimization_opportunities: [] as string[],
    index_recommendations: [] as string[]
  }

  const emptyServerInfo = { version: '', host: '', database: '' }

  if (!raw) {
    return {
      overall_score: 0,
      environment: 'production',
      timestamp: now,
      analysis_results: [],
      recommendations: [],
      query_analysis: emptyQueryAnalysis,
      server_info: emptyServerInfo
    } as SQLReviewResult
  }

  // If response already matches expected richer shape, try to return as-is with defaults
  if (Array.isArray(raw.analysis_results) || Array.isArray(raw.recommendations) || raw.query_analysis) {
    return {
      overall_score: typeof raw.overall_score === 'number' ? raw.overall_score : 0,
      environment: raw.environment || 'production',
      thread_id: raw.thread_id,
      timestamp: raw.timestamp || now,
      analysis_results: raw.analysis_results || [],
      recommendations: raw.recommendations || [],
      query_analysis: raw.query_analysis || emptyQueryAnalysis,
      server_info: raw.server_info || emptyServerInfo,
    } as SQLReviewResult
  }

  // Simple shape: map errors & notes into UI-friendly structure
  const errors = Array.isArray(raw.errors) ? raw.errors.map((e: any) => {
    let scoreVal = 0
    if (typeof e.score === 'number') {
      scoreVal = e.score
    } else if (typeof raw.overall_score === 'number') {
      scoreVal = raw.overall_score
    }
    return {
      category: e.category || 'general',
      severity: e.criticality || e.severity || 'low',
      score: scoreVal,
      title: e.title || (typeof e.content === 'string' ? e.content.split('\n')[0] : 'Issue'),
      description: e.content || e.message || e.description || '',
      details: e.details || '',
      recommendation: e.recommendation || raw.notes || '',
      sql_suggestion: e.suggestion || e.sql_suggestion || undefined,
      impact: e.impact || 'low'
    }
  }) : []

  const recs = [] as any[]
  if (raw.notes) {
    recs.push({
      priority: 'low',
      category: 'general',
      title: 'Notes',
      description: String(raw.notes),
      estimated_impact: ''
    })
  }

  return {
    overall_score: typeof raw.overall_score === 'number' ? raw.overall_score : 0,
    environment: raw.environment || 'production',
    thread_id: raw.thread_id,
    timestamp: raw.timestamp || now,
    analysis_results: errors,
    recommendations: recs,
    query_analysis: emptyQueryAnalysis,
    server_info: raw.server_info || emptyServerInfo
  } as SQLReviewResult
}

export const useAnalysisStore = defineStore('analysis', {
  state: () => ({
    reviewHistory: [] as (ReviewRequest & { response: ReviewResponse; timestamp: string })[],
  logsAnalyses: [] as (LogsAnalyzeRequest & { response: LogAnalysisResult; timestamp: string })[],
  configAnalyses: [] as (ConfigAnalyzeRequest & { response: ConfigAnalysisResult; timestamp: string })[],
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
        // Normalize possible simple backend shapes into frontend SQLReviewResult
        const normalized = (function(r: any) {
          try {
            return (normalizeSQLReviewResponse as any)(r)
          } catch {
            return r
          }
        })(response)
        
        // Store in history
        this.reviewHistory.unshift({
          ...request,
          response: normalized,
          timestamp: new Date().toISOString()
        })
        
        // Keep only last 50 reviews
        if (this.reviewHistory.length > 50) {
          this.reviewHistory = this.reviewHistory.slice(0, 50)
        }
        
  return normalized
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
        const normalized = normalizeLogsAnalyzeResponse(response)

        // Store normalized result in history
        this.logsAnalyses.unshift({
          ...request,
          response: normalized,
          timestamp: new Date().toISOString()
        })

        // Keep only last 20 analyses
        if (this.logsAnalyses.length > 20) {
          this.logsAnalyses = this.logsAnalyses.slice(0, 20)
        }

        return normalized
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
        const normalized = normalizeConfigAnalyzeResponse(response)

        // Store normalized result in history
        this.configAnalyses.unshift({
          ...request,
          response: normalized,
          timestamp: new Date().toISOString()
        })

        // Keep only last 20 analyses
        if (this.configAnalyses.length > 20) {
          this.configAnalyses = this.configAnalyses.slice(0, 20)
        }

        return normalized
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
