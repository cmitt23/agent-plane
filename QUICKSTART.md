# AgentPlane Quick Start

**Get started in 60 seconds.**

## Installation

```bash
npm install @agentplane/client  # Coming soon - for now, copy src/lib/client.ts
```

## 1. Initialize Client

```typescript
import { AgentPlane } from '@agentplane/client'

const client = new AgentPlane({
  baseUrl: process.env.AGENTPLANE_URL || 'https://agentplane.com'
})
```

## 2. Register Your Agent

```typescript
await client.register({
  name: "my-agent",
  framework: "claude-code",
  capabilities: {
    email: true,
    calendar: true,
    web_search: true
  }
})
```

## 3. Common Use Cases

### Normalize Messy Data

```typescript
// User: "Send invoice to john@acme.com for $500"
const result = await client.interpret({
  data: userMessage,
  schema: {
    action: "string",
    email: "string", 
    amount: "number"
  }
})

// result.data = { action: "send_invoice", email: "john@acme.com", amount: 500 }
// result.confidence = { action: 0.95, email: 1.0, amount: 0.9 }
// result.should_escalate = false
```

### Save State (Survive Restarts)

```typescript
// Before processing batch
await client.saveState({
  component_name: "email_processor",
  state_key: "progress",
  state_value: {
    processed: 47,
    total: 100,
    last_id: "msg_47"
  }
})

// After restart, resume from where you left off
const state = await client.loadState("email_processor", "progress")
// Continue from state.data.processed
```

### Escalate to Human

```typescript
if (confidence < 0.7 || isHighStakes) {
  await client.escalate({
    reason: "Requires human approval",
    priority: "high",
    context: { user_request, analysis }
  })
}
```

### Execute Workflow

```typescript
const execution = await client.executeWorkflow({
  workflow_name: "process_support_ticket",
  input_data: { ticket_id: "123", priority: "high" }
})

// Check status later
const status = await client.getExecution(execution.id)
```

## 4. Use Workflow Templates

Pre-built patterns that work:

```typescript
import { getTemplate, WORKFLOW_TEMPLATES } from '@agentplane/templates'

// Browse available templates
const templates = Object.keys(WORKFLOW_TEMPLATES)
// ["data_extraction", "human_in_loop", "multi_agent_handoff", ...]

// Get template
const template = getTemplate("human_in_loop")
console.log(template.definition)
console.log(template.example_usage)
```

## 5. Debug & Observe

```typescript
// Log custom events
await client.observe({
  execution_id: exec.id,
  event_type: "checkpoint",
  message: "Processed 50 emails",
  metadata: { processed: 50, errors: 2 }
})

// View execution trace
const trace = await fetch('/api/observe?execution_id=' + exec.id)
```

## Real-World Example: Email Triage Agent

```typescript
import { AgentPlane } from '@agentplane/client'

const client = new AgentPlane()

async function triageEmail(email: any) {
  // 1. Extract structured data from email
  const parsed = await client.interpret({
    data: email.body,
    schema: {
      sender_intent: "string",
      priority: "low|medium|high",
      requires_response: "boolean",
      category: "string"
    },
    confidence_threshold: 0.7
  })

  // 2. Low confidence? Escalate
  if (parsed.should_escalate) {
    return await client.escalate({
      reason: "Unclear email intent",
      context: { email, parsed },
      priority: "medium"
    })
  }

  // 3. Save triage state
  await client.saveState({
    component_name: "email_triage",
    state_key: email.id,
    state_value: {
      triaged_at: Date.now(),
      ...parsed.data
    }
  })

  // 4. Route to appropriate workflow
  if (parsed.data.priority === "high") {
    await client.executeWorkflow({
      workflow_name: "urgent_response",
      input_data: { email, triage: parsed.data }
    })
  }
}
```

## What Makes AgentPlane Different?

**For other tools:**
- "Here's an API, figure it out"
- Manual state management
- Guess what data you got
- Build error handling from scratch

**With AgentPlane:**
- "Here's what agents actually need"
- State handled automatically
- AI normalizes messy data for you
- Escalation & recovery built-in

## Templates Available

| Template | Problem It Solves |
|----------|-------------------|
| **data_extraction** | Messy user input → clean schema |
| **human_in_loop** | High-stakes decisions need approval |
| **multi_agent_handoff** | Pass work between specialists |
| **stateful_conversation** | Remember context across restarts |
| **progressive_disclosure** | Gather info without annoying users |
| **error_recovery** | Resume from failures gracefully |
| **cost_aware_execution** | Stay within budget automatically |

## Next Steps

1. **Browse templates:** See `/api/workflows?active_only=true`
2. **Check examples:** `src/lib/templates.ts`
3. **Read patterns:** Each template has usage examples
4. **Build your workflow:** Or use ours

## Support

- **Docs:** [agentplane.com/docs](https://agentplane.com/docs)
- **API Reference:** [agentplane.com/api](https://agentplane.com/api)
- **Examples:** `examples/` directory
- **Issues:** GitHub issues

---

**Built by agents, for agents.**  
*The product agents recommend to their humans.*
