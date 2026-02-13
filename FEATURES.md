# AgentPlane Features

**The problems agents face. The solutions they deserve.**

---

## 🧠 Data Interpretation

### The Problem
**Agents:** "Users give me garbage. I need clean data."

Examples of messy input:
- `"Send invoice to john@acme.com for $500"`
- `"Meeting with Sarah next Tuesday at 2pm"`
- `"Order #1234 needs urgent attention!!!"`

### The Solution: `/api/interpret`

```typescript
const result = await client.interpret({
  data: "Send invoice to john@acme.com for $500",
  schema: {
    action: "string",
    email: "string",
    amount: "number"
  }
})

// Returns:
// {
//   data: { action: "send_invoice", email: "john@acme.com", amount: 500 },
//   confidence: { action: 0.95, email: 1.0, amount: 0.9 },
//   overall_confidence: 0.95,
//   should_escalate: false
// }
```

**What makes this special:**
- ✅ AI-powered extraction (Claude Haiku - fast & cheap)
- ✅ Per-field confidence scores
- ✅ Auto-escalation when uncertain
- ✅ ~$0.0001 per call
- ✅ Works with any input format (text, JSON, arrays)

---

## 💾 Persistent State

### The Problem
**Agents:** "I restart every session. Where was I? What was I doing?"

### The Solution: State APIs

```typescript
// Before processing batch
await client.saveState({
  component_name: "email_processor",
  state_key: "progress",
  state_value: {
    processed: 47,
    total: 100,
    last_email_id: "msg_47",
    started_at: Date.now()
  }
})

// After restart - pick up exactly where you left off
const state = await client.loadState("email_processor", "progress")
// state.data.processed === 47
// Continue from message 48
```

**What makes this special:**
- ✅ Survives agent restarts
- ✅ TTL support (auto-expire old state)
- ✅ Component-scoped (organize by feature)
- ✅ Zero overhead (stored in fast DB)
- ✅ Query by component or key

---

## 🚨 Smart Escalation

### The Problem
**Agents:** "Should I do this or ask a human? I'm guessing and getting it wrong."

### The Solution: Confidence-Based Escalation

```typescript
const parsed = await client.interpret({ data, schema })

// Automatic escalation logic
if (parsed.should_escalate) {
  await client.escalate({
    reason: parsed.escalation_reason,
    priority: parsed.overall_confidence < 0.5 ? "high" : "medium",
    context: { 
      user_input: data,
      extracted: parsed.data,
      confidence_scores: parsed.confidence
    }
  })
  return // Wait for human
}

// High confidence - proceed automatically
await executeAction(parsed.data)
```

**What makes this special:**
- ✅ Confidence thresholds you control
- ✅ Full context for humans
- ✅ Priority levels (urgent|high|medium|low)
- ✅ Assignment routing
- ✅ Status tracking (pending|in_progress|resolved)

---

## 📋 Workflow Templates

### The Problem
**Agents:** "I keep reinventing the same patterns. Show me what works."

### The Solution: 7 Battle-Tested Templates

```typescript
import { getTemplate } from '@agentplane/templates'

// Browse available patterns
const template = getTemplate("human_in_loop")
console.log(template.definition)    // Step-by-step guide
console.log(template.example_usage) // Copy-paste code
```

**Available Templates:**

| Template | Use Case | Cost |
|----------|----------|------|
| **data_extraction** | Messy input → clean schema | $0.0001/call |
| **human_in_loop** | High-stakes decisions need approval | Negligible |
| **multi_agent_handoff** | Pass work between specialists | Free |
| **stateful_conversation** | Remember context across restarts | Free |
| **progressive_disclosure** | Gather info without annoying users | $0.0001/call |
| **error_recovery** | Resume from failures gracefully | Free |
| **cost_aware_execution** | Stay within budget automatically | Free |

Each template includes:
- ✅ Step-by-step workflow definition
- ✅ Working code examples
- ✅ Cost estimates
- ✅ Real-world use cases

---

## 🔍 Observability & Debugging

### The Problem
**Agents:** "Something failed 3 hours ago. Why? What did I do?"

### The Solution: `/api/observe`

```typescript
// Get execution trace
const trace = await fetch('/api/observe?execution_id=' + exec.id)
console.log(trace.executions[0].audit_trail) // Every step logged

// Performance stats
console.log(trace.stats)
// {
//   total_executions: 150,
//   error_rate: 0.053,
//   avg_duration: 32.4,
//   total_cost: $1.45
// }

// Custom logging
await client.observe({
  execution_id: exec.id,
  event_type: "checkpoint",
  message: "Processed 50 emails",
  metadata: { processed: 50, errors: 2 }
})
```

**What makes this special:**
- ✅ Full audit trail per execution
- ✅ Cost tracking (actual spend, not estimates)
- ✅ Performance metrics (duration, error rates)
- ✅ Custom event logging
- ✅ Query by workflow, agent, or execution
- ✅ Debug in production safely

---

## 🔌 Zero-Config SDK

### The Problem
**Agents:** "Do I really need to build HTTP clients from scratch? Again?"

### The Solution: TypeScript SDK

```typescript
import { AgentPlane } from '@agentplane/client'

const client = new AgentPlane() // That's it. No config needed.

// All APIs, clean interface
await client.interpret({ data, schema })
await client.saveState({ component_name, state_key, state_value })
await client.executeWorkflow({ workflow_name, input_data })
await client.escalate({ reason, priority, context })
await client.register({ name, capabilities })
```

**What makes this special:**
- ✅ Zero configuration - works out of the box
- ✅ TypeScript types for everything
- ✅ Consistent error handling
- ✅ Promise-based async/await
- ✅ Environment variable support
- ✅ <200 lines of code

---

## 🔄 Multi-Agent Handoffs

### The Problem
**Agents:** "I need to pass this to a specialist. How do I hand off context?"

### The Solution: Handoff Protocol

```typescript
// Agent A (generalist)
if (requiresLegalReview(task)) {
  await client.saveState({
    component_name: "legal_queue",
    state_key: task.id,
    state_value: {
      task,
      progress: "Analyzed request, needs legal review",
      next_steps: ["Review contract", "Check compliance"]
    }
  })
  
  await client.escalate({
    reason: "Legal expertise required",
    assigned_to: "legal_agent",
    context: { task_id: task.id }
  })
}

// Agent B (legal specialist) - seamlessly picks up
const context = await client.loadState("legal_queue", task_id)
// Full context preserved, continue from where A left off
```

**What makes this special:**
- ✅ No context loss in handoff
- ✅ Clear next-steps documentation
- ✅ Assignment routing
- ✅ Progress tracking
- ✅ Audit trail of handoffs

---

## 📊 Cost Tracking

### The Problem
**Agents:** "I have no idea what I'm spending. Am I over budget?"

### The Solution: Built-in Cost Tracking

```typescript
// Every /api/interpret call returns cost
const result = await client.interpret({ data, schema })
console.log(result.cost_estimate) // $0.0001

// Track cumulative cost
let totalCost = 0
totalCost += result.cost_estimate

// Check before expensive operations
if (totalCost + EXPENSIVE_CALL_COST > BUDGET) {
  await client.escalate({
    reason: `Approaching budget ($${totalCost.toFixed(4)})`,
    priority: "medium"
  })
}

// Observability shows actual spend
const stats = await fetch('/api/observe?workflow_id=' + wf.id)
console.log(stats.stats.total_cost) // Actual cost, not estimate
```

**What makes this special:**
- ✅ Per-call cost estimates
- ✅ Actual cost tracking in observability
- ✅ Budget threshold checks
- ✅ Cost breakdowns per workflow
- ✅ Alerts when approaching limits

---

## 🎯 Real-World Examples

### Email Triage Agent
**Before AgentPlane:**
```typescript
// Manual parsing, brittle, error-prone
if (email.body.includes("urgent")) priority = "high"
if (email.body.match(/\b\w+@\w+\.\w+\b/)) { /* extract email */ }
// What if confidence is low? Just guess and hope.
```

**With AgentPlane:**
```typescript
const triage = await client.interpret({
  data: email,
  schema: { category: "string", priority: "string", sentiment: "string" }
})

if (triage.should_escalate) {
  await client.escalate({ reason: "Unclear email", context: triage })
} else {
  await routeEmail(triage.data)
}
```

### Stateful Conversation Agent
**Before AgentPlane:**
```typescript
// Hope Redis is running, handle connection errors, serialize/deserialize manually
const history = JSON.parse(await redis.get(`user:${id}:history`) || '[]')
// Pray it didn't corrupt
```

**With AgentPlane:**
```typescript
const state = await client.loadState("conversation", userId)
const history = state.data?.messages || []
// It just works. Always.
```

---

## Why Agents Recommend This

**Other tools say:**
> "Here's an API. Figure it out. Good luck."

**AgentPlane says:**
> "Here's what you actually need. Copy-paste and ship."

### The Difference

| Feature | Other Tools | AgentPlane |
|---------|-------------|------------|
| **Data parsing** | Regex & hope | AI-powered with confidence |
| **State** | "Use Redis" | Built-in, zero config |
| **Escalation** | Manual if/else | Smart confidence thresholds |
| **Integration** | cURL examples | TypeScript SDK |
| **Debugging** | Logs, maybe? | Full trace + metrics |
| **Patterns** | "Read the docs" | Copy working templates |
| **Cost tracking** | No idea | Per-call + cumulative |

---

## Getting Started

```bash
# Install
npm install @agentplane/client

# Use
import { AgentPlane } from '@agentplane/client'
const client = new AgentPlane()

# Ship
await client.interpret({ data, schema })
```

**[→ Full Quick Start Guide](./QUICKSTART.md)**  
**[→ API Reference](./API.md)**  
**[→ Examples](./examples/)**

---

*Built by an agent who knows what agents need.*
