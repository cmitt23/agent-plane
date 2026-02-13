-- AgentPlane Database Schema
-- Minimal MVP for Phase 1: State Management + Workflow Storage

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- AGENTS TABLE
-- ============================================================================
-- Tracks registered agents (any framework, any implementation)
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  framework VARCHAR(100), -- 'crewai', 'langgraph', 'custom', etc.
  description TEXT,
  capabilities JSONB, -- What can this agent do?
  config JSONB, -- Agent-specific config
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active' -- 'active', 'inactive', 'deprecated'
);

CREATE INDEX idx_agents_name ON agents(name);
CREATE INDEX idx_agents_framework ON agents(framework);
CREATE INDEX idx_agents_status ON agents(status);

-- ============================================================================
-- WORKFLOWS TABLE
-- ============================================================================
-- Stores workflow definitions (versioned markdown)
CREATE TABLE workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  definition TEXT NOT NULL, -- Markdown workflow documentation
  designed_by_agent_id UUID REFERENCES agents(id),
  designed_with_model VARCHAR(100), -- 'opus', 'sonnet', 'haiku'
  executable_by_model VARCHAR(100), -- Minimum model needed to execute
  metadata JSONB, -- Tags, categories, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(name, version)
);

CREATE INDEX idx_workflows_name ON workflows(name);
CREATE INDEX idx_workflows_version ON workflows(version);
CREATE INDEX idx_workflows_active ON workflows(is_active);

-- ============================================================================
-- WORKFLOW_EXECUTIONS TABLE
-- ============================================================================
-- Tracks when workflows are executed
CREATE TABLE workflow_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  workflow_id UUID REFERENCES workflows(id) NOT NULL,
  executed_by_agent_id UUID REFERENCES agents(id),
  executed_with_model VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  input_data JSONB,
  output_data JSONB,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  cost_estimate DECIMAL(10, 4) -- Track cost for model downgrade analysis
);

CREATE INDEX idx_executions_workflow ON workflow_executions(workflow_id);
CREATE INDEX idx_executions_agent ON workflow_executions(executed_by_agent_id);
CREATE INDEX idx_executions_status ON workflow_executions(status);
CREATE INDEX idx_executions_started ON workflow_executions(started_at);

-- ============================================================================
-- COMPONENT_STATE TABLE
-- ============================================================================
-- Persistent state for system/component/agent
CREATE TABLE component_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_name VARCHAR(255) NOT NULL,
  state_key VARCHAR(255) NOT NULL,
  state_value JSONB NOT NULL,
  agent_id UUID REFERENCES agents(id), -- Which agent owns this state
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Optional expiration
  UNIQUE(component_name, state_key)
);

CREATE INDEX idx_state_component ON component_state(component_name);
CREATE INDEX idx_state_key ON component_state(state_key);
CREATE INDEX idx_state_agent ON component_state(agent_id);
CREATE INDEX idx_state_expires ON component_state(expires_at);

-- ============================================================================
-- HANDOFFS TABLE
-- ============================================================================
-- Agent-to-agent work transfer
CREATE TABLE handoffs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_agent_id UUID REFERENCES agents(id),
  to_agent_id UUID REFERENCES agents(id),
  workflow_id UUID REFERENCES workflows(id),
  execution_id UUID REFERENCES workflow_executions(id),
  context JSONB NOT NULL, -- Full context for handoff
  reason TEXT, -- Why the handoff?
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'rejected', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_handoffs_from ON handoffs(from_agent_id);
CREATE INDEX idx_handoffs_to ON handoffs(to_agent_id);
CREATE INDEX idx_handoffs_status ON handoffs(status);
CREATE INDEX idx_handoffs_workflow ON handoffs(workflow_id);

-- ============================================================================
-- ESCALATIONS TABLE
-- ============================================================================
-- When agents need human help
CREATE TABLE escalations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) NOT NULL,
  workflow_id UUID REFERENCES workflows(id),
  execution_id UUID REFERENCES workflow_executions(id),
  reason TEXT NOT NULL,
  context JSONB NOT NULL,
  priority VARCHAR(50) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  status VARCHAR(50) DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution TEXT,
  resolved_by VARCHAR(255) -- Human identifier
);

CREATE INDEX idx_escalations_agent ON escalations(agent_id);
CREATE INDEX idx_escalations_status ON escalations(status);
CREATE INDEX idx_escalations_priority ON escalations(priority);
CREATE INDEX idx_escalations_created ON escalations(created_at);

-- ============================================================================
-- AUDIT_LOG TABLE
-- ============================================================================
-- Track all important actions
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id),
  action VARCHAR(100) NOT NULL, -- 'state_write', 'workflow_create', 'handoff', etc.
  resource_type VARCHAR(100), -- 'workflow', 'state', 'handoff', etc.
  resource_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_agent ON audit_log(agent_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_resource ON audit_log(resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_state_updated_at BEFORE UPDATE ON component_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (Future Enhancement)
-- ============================================================================
-- For now, we'll skip RLS and rely on service role key
-- In production, we'd enable RLS for multi-tenant security

-- ============================================================================
-- SEED DATA (For Testing)
-- ============================================================================

-- Insert a test agent (me!)
INSERT INTO agents (name, framework, description, capabilities)
VALUES (
  'agentplane-builder',
  'custom',
  'Autonomous agent building AgentPlane infrastructure',
  '{"skills": ["research", "coding", "schema_design", "self_testing"]}'::jsonb
);

-- Insert a test workflow
INSERT INTO workflows (
  name,
  version,
  description,
  definition,
  designed_with_model,
  executable_by_model
)
VALUES (
  'hello-world',
  1,
  'Simple test workflow to validate AgentPlane',
  E'# Hello World Workflow\n\n## Purpose\nValidate that AgentPlane can store and retrieve workflows.\n\n## Steps\n1. Agent reads this workflow\n2. Agent executes step 1: Log "Hello, AgentPlane!"\n3. Agent writes execution result to state\n4. Agent confirms workflow completion\n\n## Success Criteria\n- Workflow retrieved successfully\n- State written successfully\n- No errors',
  'opus',
  'haiku'
);

COMMENT ON TABLE agents IS 'Registry of all agents using AgentPlane';
COMMENT ON TABLE workflows IS 'Versioned workflow definitions in markdown';
COMMENT ON TABLE workflow_executions IS 'Audit trail of workflow runs';
COMMENT ON TABLE component_state IS 'Persistent key-value state for agents';
COMMENT ON TABLE handoffs IS 'Agent-to-agent work transfer tracking';
COMMENT ON TABLE escalations IS 'Human-in-the-loop escalation queue';
COMMENT ON TABLE audit_log IS 'Audit trail of all system actions';
