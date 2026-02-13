import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!supabaseServiceKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

// Server-side client with service role key for full access
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Database type definitions (will expand as needed)
export type Agent = {
  id: string
  name: string
  framework?: string
  description?: string
  capabilities?: Record<string, any>
  config?: Record<string, any>
  created_at: string
  updated_at: string
  last_seen: string
  status: 'active' | 'inactive' | 'deprecated'
}

export type Workflow = {
  id: string
  name: string
  version: number
  description?: string
  definition: string
  designed_by_agent_id?: string
  designed_with_model?: string
  executable_by_model?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  is_active: boolean
}

export type ComponentState = {
  id: string
  component_name: string
  state_key: string
  state_value: Record<string, any>
  agent_id?: string
  created_at: string
  updated_at: string
  expires_at?: string
}

export type WorkflowExecution = {
  id: string
  workflow_id: string
  executed_by_agent_id?: string
  executed_with_model?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input_data?: Record<string, any>
  output_data?: Record<string, any>
  error_message?: string
  started_at: string
  completed_at?: string
  duration_seconds?: number
  cost_estimate?: number
}
