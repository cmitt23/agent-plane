/**
 * AgentPlane Client SDK
 * 
 * Makes it trivial for agents to integrate with AgentPlane.
 * Zero config, maximum clarity.
 */

type AgentPlaneConfig = {
  baseUrl?: string
  apiKey?: string // For future auth
}

type InterpretRequest = {
  data: any
  schema: Record<string, any>
  context?: string
  confidence_threshold?: number
}

type InterpretResponse = {
  success: boolean
  data: any
  confidence: Record<string, number>
  overall_confidence: number
  missing_fields: string[]
  notes?: string
  should_escalate: boolean
  escalation_reason?: string | null
  model_used: string
  cost_estimate: number
}

type WorkflowExecutionRequest = {
  workflow_name: string
  input_data?: Record<string, any>
  agent_id?: string
  model?: string
}

type WorkflowExecutionResponse = {
  id: string
  workflow_id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  started_at: string
}

type EscalationRequest = {
  workflow_execution_id?: string
  reason: string
  context?: Record<string, any>
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  assigned_to?: string
}

type StateRequest = {
  component_name: string
  state_key: string
  state_value: Record<string, any>
  agent_id?: string
  expires_in_seconds?: number
}

export class AgentPlane {
  private baseUrl: string
  private apiKey?: string

  constructor(config: AgentPlaneConfig = {}) {
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_AGENTPLANE_URL || 'http://localhost:3000'
    this.apiKey = config.apiKey || process.env.AGENTPLANE_API_KEY
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    }

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `Request failed: ${response.status}`)
    }

    return data
  }

  /**
   * Normalize messy data into a clean schema
   * 
   * @example
   * const result = await client.interpret({
   *   data: "John Smith, email: john@example.com, he's 32",
   *   schema: { name: "string", email: "string", age: "number" }
   * })
   */
  async interpret(request: InterpretRequest): Promise<InterpretResponse> {
    return this.request('/api/interpret', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Save state for a component (survives agent restarts)
   * 
   * @example
   * await client.saveState({
   *   component_name: "email_processor",
   *   state_key: "last_processed_id",
   *   state_value: { id: "msg_123", timestamp: Date.now() }
   * })
   */
  async saveState(request: StateRequest) {
    return this.request('/api/state', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Load state for a component
   * 
   * @example
   * const state = await client.loadState("email_processor", "last_processed_id")
   */
  async loadState(component_name: string, state_key: string) {
    const params = new URLSearchParams({ component_name, state_key })
    return this.request(`/api/state?${params}`)
  }

  /**
   * Execute a workflow
   * 
   * @example
   * const execution = await client.executeWorkflow({
   *   workflow_name: "process_support_ticket",
   *   input_data: { ticket_id: "123", priority: "high" }
   * })
   */
  async executeWorkflow(request: WorkflowExecutionRequest): Promise<WorkflowExecutionResponse> {
    return this.request('/api/executions', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Get workflow execution status
   */
  async getExecution(id: string) {
    return this.request(`/api/executions/${id}`)
  }

  /**
   * Escalate to a human when stuck
   * 
   * @example
   * await client.escalate({
   *   reason: "User request requires legal review",
   *   priority: "high",
   *   context: { ticket_id: "123" }
   * })
   */
  async escalate(request: EscalationRequest) {
    return this.request('/api/escalations', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Get available workflows
   */
  async getWorkflows(filters?: { name?: string; active_only?: boolean }) {
    const params = new URLSearchParams()
    if (filters?.name) params.set('name', filters.name)
    if (filters?.active_only) params.set('active_only', 'true')
    
    return this.request(`/api/workflows?${params}`)
  }

  /**
   * Register this agent with AgentPlane
   * 
   * @example
   * await client.register({
   *   name: "support-agent",
   *   framework: "claude-code",
   *   capabilities: { email: true, calendar: true }
   * })
   */
  async register(request: {
    name: string
    framework?: string
    description?: string
    capabilities?: Record<string, any>
    config?: Record<string, any>
  }) {
    return this.request('/api/agents', {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Heartbeat - keep agent status alive
   */
  async heartbeat(agent_id: string) {
    return this.request('/api/agents', {
      method: 'PATCH',
      body: JSON.stringify({ 
        agent_id,
        last_seen: new Date().toISOString(),
        status: 'active'
      })
    })
  }
}

// Convenience export for quick usage
export const createClient = (config?: AgentPlaneConfig) => new AgentPlane(config)

// Default client instance (can be configured via env vars)
export const agentplane = new AgentPlane()
