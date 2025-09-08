// Enums and Type Aliases
export type Environment = 'development' | 'staging' | 'production' | 'testing'
export type Severity = 'low' | 'medium' | 'high' | 'critical'
export type Priority = 'low' | 'medium' | 'high' | 'critical'
export type Impact = 'low' | 'medium' | 'high'
export type Grade = 'A' | 'B' | 'C' | 'D' | 'F'
export type TaskStatus = 'pending' | 'running' | 'success' | 'error' | 'completed' | 'failed'
export type TaskType = 'log_analysis' | 'config_check' | 'query_analysis' | 'custom_sql' | 'table_analysis'
export type RuleCategory = 'config' | 'sql'
export type AnalysisTarget = 'logs' | 'config' | 'performance' | 'security' | 'tables' | 'queries'
export type LogLevel = 'debug' | 'info' | 'warning' | 'error'
export type LogSource = 'application' | 'postgresql'
export type OutputFormat = 'json' | 'csv'
export type QueryType = 'SELECT' | 'DML/DDL'

// Connection Types
export interface DatabaseConnection {
  id: number
  name: string
  host: string
  port: number
  database: string
  username: string
  vault_path: string
  environment: Environment
  description?: string
  tags?: string[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface CreateConnectionRequest {
  name: string
  host: string
  port: number
  database: string
  username: string
  password?: string
  vault_path?: string
  environment: Environment
  description?: string
  tags?: string[]
  is_active: boolean
}

// Scheduler Types (новый API вместо Tasks)
export interface ScheduledTask {
  id: number
  name: string
  task_type: TaskType
  connection_id: number
  cron_schedule: string
  description?: string
  task_params: SchedulerTaskParams
  is_active: boolean
  created_at?: string
  updated_at?: string
  last_execution?: TaskExecution | null
  next_run?: string | null
}

export interface SchedulerTaskParams {
  analysis_target: AnalysisTarget
  custom_sql?: string
  target_tables?: string[]
  query_timeout?: number
  output_format: OutputFormat
  detailed_analysis: boolean
}

export interface CreateScheduledTaskRequest {
  name: string
  task_type: TaskType
  connection_id: number
  cron_schedule: string
  description?: string
  task_params: SchedulerTaskParams
  is_active: boolean
}

export interface TaskExecution {
  id: number
  task_id: number
  status: TaskStatus
  started_at: string
  completed_at?: string
  duration_seconds?: number
  result?: any
  error_message?: string
}

// Legacy Task Types (для обратной совместимости)
export interface Task {
  id: number
  name: string
  connection_id: number
  schedule: string
  task_type: TaskType
  parameters: TaskParameters
  is_active: boolean
  created_at?: string
  updated_at?: string
  last_run?: string | null
  next_run?: string | null
}

export interface TaskParameters {
  // Common parameters
  analysis_target?: AnalysisTarget
  environment?: Environment
  detailed_analysis?: boolean
  output_format?: OutputFormat
  query_timeout?: number
  
  // For log_analysis
  log_level?: LogLevel
  log_source?: LogSource
  time_range_hours?: number
  
  // For config_check
  config_sections?: string[]
  check_performance?: boolean
  check_security?: boolean
  
  // For custom_sql
  custom_sql?: string
  
  // For table_analysis
  target_tables?: string[]
  
  // Retry parameters
  max_retries?: number
  retry_delay?: number
  
  // Legacy parameters for backward compatibility
  retention_days?: number
}

export interface CreateTaskRequest {
  name: string
  connection_id: number
  schedule: string
  task_type: TaskType
  parameters: TaskParameters
  is_active: boolean
}

// Scheduler Types
// Task Types - удаляем дублирование, используем только ScheduledTask и SchedulerTaskParams
export interface ScheduledTask {
  id: number
  name: string
  task_type: TaskType
  connection_id: number
  cron_schedule: string
  description?: string
  task_params: SchedulerTaskParams
  is_active: boolean
  created_at?: string
  updated_at?: string
  last_execution?: TaskExecution | null
  next_run?: string | null
}

export interface CreateScheduledTaskRequest {
  name: string
  task_type: TaskType
  connection_id: number
  cron_schedule: string
  description?: string
  task_params: SchedulerTaskParams
  is_active: boolean
}

export interface TaskExecution {
  id: number
  task_id: number
  status: TaskStatus
  started_at: string
  completed_at?: string
  duration_seconds?: number
  result?: any
  error_message?: string
}

// Алиас для обратной совместимости
export type SchedulerTask = ScheduledTask
export type CreateSchedulerTaskRequest = CreateScheduledTaskRequest

export interface SchedulerStats {
  tasks: {
    total_tasks: number
    active_tasks: number
    inactive_tasks: number
  }
  executions_24h: {
    total_executions: number
    completed: number
    failed: number
    running: number
  }
  timestamp: string
}

export interface QueueStatus {
  queue_length: number
  timestamp: string
}

export interface TaskExecutionStats {
  task_id: number
  task_name: string
  total_executions: number
  successful_executions: number
  failed_executions: number
  avg_execution_time_seconds: number
  last_execution?: string
  next_execution?: string
}

// Rule Types
export interface Rule {
  filename: string
  title: string
  category: RuleCategory
  content?: string
}

export interface CreateRuleRequest {
  category: RuleCategory
  filename: string
  title: string
  content: string
}

export interface IngestRulesRequest {
  rules_dir: string
}

// Config Analysis Types
export interface ConfigAnalysisRequest {
  connection_id?: number // For getting config from existing connection
  config?: Record<string, string> // For manual config input
  environment: Environment
  server_info?: {
    version: string
    host: string
    database: string
  }
}

export interface ConfigAnalysisResult {
  overall_score: number
  environment: string
  timestamp: string
  analysis_results: AnalysisResult[]
  recommendations: Recommendation[]
  summary: AnalysisSummary
  server_info: ServerInfo
}

export interface AnalysisResult {
  category: string
  parameter: string
  current_value: string
  recommended_value: string
  severity: Severity
  score: number
  description: string
  impact: string
  recommendation: string
}

export interface Recommendation {
  priority: Priority
  category: string
  title: string
  description: string
  sql_command: string
}

export interface AnalysisSummary {
  total_parameters_analyzed: number
  high_priority_issues: number
  medium_priority_issues: number
  low_priority_issues: number
  configuration_grade: Grade
}

// SQL Review Types
export interface SQLReviewRequest {
  connection_id?: number // For executing query on existing connection
  sql: string
  query_plan?: any
  tables?: Array<{
    name: string
    schema: string
    row_count: number
    indexes: string[]
  }>
  server_info?: {
    version: string
    host: string
    database: string
  }
  thread_id?: string
  environment: Environment
}

export interface SQLReviewResult {
  overall_score: number
  environment: string
  thread_id?: string
  timestamp: string
  analysis_results: SQLAnalysisResult[]
  recommendations: SQLRecommendation[]
  query_analysis: QueryAnalysis
  server_info: ServerInfo
}

export interface SQLAnalysisResult {
  category: string
  severity: Severity
  score: number
  title: string
  description: string
  details: string
  recommendation: string
  sql_suggestion?: string
  impact: Impact
}

export interface SQLRecommendation {
  priority: Priority
  category: string
  title: string
  description: string
  sql_command?: string
  estimated_impact: string
}

export interface QueryAnalysis {
  complexity_score: number
  estimated_execution_time: number
  resource_usage: string
  optimization_opportunities: string[]
  index_recommendations: string[]
}

export interface TableInfo {
  name: string
  schema: string
  row_count: number
  indexes: string[]
}

// Log Analysis Types
export interface LogAnalysisRequest {
  connection_id?: number // For getting logs from existing connection
  logs?: string // For manual log input
  server_info?: ServerInfo
  environment: Environment
}

export interface LogAnalysisResult {
  errors: LogError[]
  overall_score: number
  notes: string
  analysis_summary: LogAnalysisSummary
}

export interface LogError {
  severity: string
  timestamp: string
  message: string
  category: string
  description: string
  impact: Impact
  recommendation: string
  query?: string
  line_number: number
}

export interface LogAnalysisSummary {
  total_log_lines: number
  error_count: number
  warning_count: number
  slow_query_count: number
  connection_events: number
  performance_issues: PerformanceIssue[]
  security_issues: any[]
  connection_issues: any[]
  categories: {
    errors: number
    warnings: number
    performance: number
    security: number
    connections: number
  }
  time_range: {
    start: string
    end: string
    duration_minutes: number
  }
  recommendations: LogRecommendation[]
}

export interface PerformanceIssue {
  type: string
  duration_ms: number
  query: string
  recommendation: string
}

export interface LogRecommendation {
  priority: Priority
  category: string
  title: string
  description: string
}

// Monitoring Types
// Common Types
export interface ServerInfo {
  version: string
  host: string
  database: string
}

export interface ApiError {
  detail: string
  code?: string
}

export interface ReviewResult {
  id: string
  connection_id: number
  task_type: string
  status: TaskStatus
  results: any
  created_at: string
  completed_at?: string
}

// Task Result Types
export interface LogAnalysisTaskResult {
  issues: Array<{
    content: string
    criticality: Severity
    recommendation: string
  }>
  overall_score: number
  analyzed_queries: number
  recommendations: any[]
}

export interface ConfigCheckTaskResult {
  issues: Array<{
    content: string
    criticality: Severity
    recommendation: string
  }>
  overall_score: number
  config_details: any
}

export interface QueryAnalysisTaskResult {
  message: string
  analyzed_queries: number
  queries: Array<{
    query: string
    calls: number
    total_exec_time: number
    mean_exec_time: number
  }>
}

export interface CustomSQLTaskResult {
  message: string
  sql: string
  execution_time_seconds: number
  query_type: QueryType
  rows_returned?: number
  rows_affected?: number
  data?: any[]
  columns?: string[]
  operation?: string
}

export interface TableAnalysisTaskResult {
  message: string
  analyzed_tables_count: number
  tables: Array<{
    table: string
    schema: string
    owner: string
    total_size: string
    table_size: string
    indexes_size: string
    estimated_rows: number
    dead_rows: number
    has_indexes: boolean
    has_triggers: boolean
    last_vacuum?: string
    last_analyze?: string
    columns?: any[]
    indexes?: any[]
  }>
  detailed_analysis: boolean
}

// Review API Types
export interface ReviewRequest {
  sql: string
  query_plan?: any
  tables?: Array<{
    name: string
    schema: string
    row_count: number
    indexes: string[]
  }>
  database_stats?: {
    total_size: string
    active_connections: number
    version: string
  }
}

export interface ReviewResponse {
  overall_score: number
  grade: Grade
  issues: Array<{
    severity: Severity
    category: string
    description: string
    recommendation: string
    impact: Impact
    affected_query?: string
    line_number?: number
  }>
  performance_insights: {
    estimated_cost: number
    execution_time_estimate: string
    memory_usage: string
    disk_usage: string
  }
  security_analysis: {
    sql_injection_risk: Severity
    privilege_escalation_risk: Severity
    data_exposure_risk: Severity
  }
  query_analysis: {
    query_type: string
    complexity: Severity
    tables_accessed: string[]
    joins_count: number
    subqueries_count: number
  }
}

// Logs API Types
export interface LogsAnalyzeRequest {
  logs: string
  server_info: {
    version: string
    host: string
    database: string
  }
  environment: Environment
}

export interface LogsAnalyzeResponse {
  errors: Array<{
    severity: string
    timestamp: string
    message: string
    category: string
    description: string
    impact: Impact
    recommendation: string
    query?: string
    line_number: number
  }>
  overall_score: number
  grade: Grade
  summary: {
    total_lines: number
    error_count: number
    warning_count: number
    time_range: {
      start: string
      end: string
    }
  }
}

// Config API Types
export interface ConfigAnalyzeRequest {
  config: Record<string, any>
  environment: Environment
  server_info: {
    version: string
    host: string
    database: string
  }
}

export interface ConfigAnalyzeResponse {
  overall_score: number
  environment: Environment
  recommendations: Array<{
    parameter: string
    current_value: string
    recommended_value: string
    impact: Impact
    category: string
    description: string
  }>
  issues: Array<{
    severity: Severity
    parameter: string
    description: string
    recommendation: string
    category: string
  }>
  performance_score: number
  security_score: number
  maintenance_score: number
}

// Monitoring API Types
export interface MonitoringTaskExecution {
  id: number
  task_id: number
  status: TaskStatus
  started_at: string
  completed_at?: string
  duration_seconds?: number
  result?: any
  error_message?: string
}

export interface MonitoringStats {
  system: {
    uptime: string
    memory_usage: number
    cpu_usage: number
    disk_usage: number
  }
  database: {
    active_connections: number
    total_size: string
    cache_hit_ratio: number
  }
  scheduler: {
    active_tasks: number
    completed_today: number
    failed_today: number
    queue_size: number
  }
}
