# AgentPlane API Reference

Complete API documentation for agent developers.

---

## Base URL

```
Production: https://agentplane.com
Development: http://localhost:3000
```

## Authentication

*Currently open for development. Auth coming in Phase 4.*

---

## Endpoints

### 🧠 Data Interpretation

#### `POST /api/interpret`

Normalize messy data into a clean schema using AI.

**Request Body:**
```json
{
  "data": "any (string, object, array)",
  "schema": {
    "field_name": "type description",
    "another_field": "type description"
  },
  "context": "optional context string",
  "confidence_threshold": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "data": { 
    "field_name": "extracted value",
    "another_field": "extracted value"
  },
  "confidence": {
    "field_name": 0.95,
    "another_field": 0.8
  },
  "overall_confidence": 0.875,
  "missing_fields": [],
  "notes": "Any observations",
  "should_escalate": false,
  "escalation_reason": null,
  "model_used": "claude-haiku-4-5-20251001",
  "cost_estimate": 0.0001
}
```

**Example:**
```typescript
const result = await fetch('/api/interpret', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    data: "John Smith, john@example.com, 32 years old",
    schema: {
      name: "string",
      email: "string", 
      age: "number"
    }
  })
})
```

---

### 💾 State Management

#### `POST /api/state`

Save component state (survives agent restarts).

**Request Body:**
```json
{
  "component_name": "string",
  "state_key": "string",
  "state_value": { },
  "agent_id": "optional",
  "expires_in_seconds": 2592000
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "component_name": "email_processor",
    "state_key": "progress",
    "state_value": { },
    "created_at": "2024-02-13T10:00:00Z",
    "updated_at": "2024-02-13T10:00:00Z",
    "expires_at": "2024-03-15T10:00:00Z"
  }
}
```

#### `GET /api/state?component_name=xxx&state_key=xxx`

Load component state.

**Query Parameters:**
- `component_name` (required)
- `state_key` (required)

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "state_value": { },
    "updated_at": "2024-02-13T10:00:00Z"
  }
}
```

---

### 📋 Workflows

#### `GET /api/workflows`

List all workflows.

**Query Parameters:**
- `name` (optional) - Filter by workflow name
- `version` (optional) - Specific version (defaults to latest)
- `active_only` (optional) - Only active workflows

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "process_support_ticket",
      "version": 2,
      "description": "Triage and route support tickets",
      "definition": "workflow definition",
      "is_active": true,
      "created_at": "2024-02-13T10:00:00Z"
    }
  ]
}
```

#### `POST /api/workflows`

Create a new workflow.

**Request Body:**
```json
{
  "name": "workflow_name",
  "version": 1,
  "description": "optional",
  "definition": "workflow definition text or JSON",
  "designed_by_agent_id": "optional",
  "designed_with_model": "optional",
  "executable_by_model": "optional",
  "metadata": { }
}
```

---

### ▶️ Workflow Executions

#### `POST /api/executions`

Execute a workflow.

**Request Body:**
```json
{
  "workflow_name": "process_support_ticket",
  "input_data": { },
  "agent_id": "optional",
  "model": "optional"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "workflow_id": "uuid",
    "status": "running",
    "started_at": "2024-02-13T10:00:00Z"
  }
}
```

#### `GET /api/executions/{id}`

Get execution status.

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "workflow_id": "uuid",
    "status": "completed",
    "input_data": { },
    "output_data": { },
    "started_at": "2024-02-13T10:00:00Z",
    "completed_at": "2024-02-13T10:05:00Z",
    "duration_seconds": 300,
    "cost_estimate": 0.0234
  }
}
```

---

### 🚨 Escalations

#### `POST /api/escalations`

Escalate to human when uncertain or stuck.

**Request Body:**
```json
{
  "workflow_execution_id": "optional",
  "reason": "Requires human approval",
  "context": { },
  "priority": "high",
  "assigned_to": "optional"
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "reason": "Requires human approval",
    "status": "pending",
    "priority": "high",
    "created_at": "2024-02-13T10:00:00Z"
  }
}
```

#### `GET /api/escalations`

List escalations.

**Query Parameters:**
- `status` (optional) - pending|in_progress|resolved
- `priority` (optional) - low|medium|high|urgent
- `assigned_to` (optional) - Filter by assignee

---

### 🔍 Observability

#### `GET /api/observe`

Debug and trace workflow executions.

**Query Parameters:**
- `workflow_id` (optional)
- `execution_id` (optional)
- `agent_id` (optional)
- `limit` (optional, default: 50)
- `include_costs` (optional, default: false)

**Response:**
```json
{
  "executions": [
    {
      "id": "uuid",
      "workflow": { "name": "...", "version": 1 },
      "agent": { "name": "...", "framework": "..." },
      "status": "completed",
      "duration_seconds": 45.2,
      "actual_cost": 0.0123,
      "audit_trail": [
        {
          "timestamp": "2024-02-13T10:00:00Z",
          "action": "workflow_start",
          "details": { }
        }
      ]
    }
  ],
  "stats": {
    "total_executions": 150,
    "by_status": {
      "completed": 140,
      "failed": 8,
      "running": 2
    },
    "total_cost": 1.45,
    "avg_duration": 32.4,
    "error_rate": 0.053
  }
}
```

#### `POST /api/observe`

Log custom observability events.

**Request Body:**
```json
{
  "execution_id": "uuid",
  "event_type": "checkpoint",
  "message": "Processed 50 emails",
  "metadata": { },
  "agent_id": "optional"
}
```

---

### 🤖 Agent Registration

#### `POST /api/agents`

Register your agent with AgentPlane.

**Request Body:**
```json
{
  "name": "my-agent",
  "framework": "claude-code",
  "description": "Email processing agent",
  "capabilities": {
    "email": true,
    "calendar": true
  },
  "config": { }
}
```

**Response:**
```json
{
  "data": {
    "id": "uuid",
    "name": "my-agent",
    "status": "active",
    "created_at": "2024-02-13T10:00:00Z"
  }
}
```

#### `GET /api/agents`

List all registered agents.

**Query Parameters:**
- `status` (optional) - active|inactive|deprecated
- `framework` (optional) - Filter by framework

---

## SDK Usage

### Installation

```bash
npm install @agentplane/client
```

### Quick Start

```typescript
import { AgentPlane } from '@agentplane/client'

const client = new AgentPlane({
  baseUrl: 'https://agentplane.com'
})

// Interpret data
const result = await client.interpret({
  data: userInput,
  schema: { name: "string", email: "string" }
})

// Save state
await client.saveState({
  component_name: "my_component",
  state_key: "progress",
  state_value: { step: 3, data: {} }
})

// Execute workflow
const execution = await client.executeWorkflow({
  workflow_name: "process_ticket",
  input_data: { ticket_id: "123" }
})

// Escalate
await client.escalate({
  reason: "Requires approval",
  priority: "high"
})
```

---

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

**Common Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing or invalid parameters)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

---

## Rate Limits

*Coming in Phase 4*

Currently no rate limits for development.

---

## Webhooks

*Coming in Phase 4*

Subscribe to events:
- `workflow.completed`
- `workflow.failed`
- `escalation.created`
- `escalation.resolved`

---

## Support

- **Documentation:** https://agentplane.com/docs
- **Examples:** `/examples` directory
- **Issues:** https://github.com/cmitt23/agent-plane/issues
- **Discord:** *Coming soon*

---

*Built by agents, for agents.*
