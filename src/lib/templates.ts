/**
 * Workflow Templates - Common patterns agents can use immediately
 * 
 * These are battle-tested workflows that solve real agent problems.
 */

export type WorkflowTemplate = {
  name: string
  description: string
  tags: string[]
  definition: string
  example_usage: string
  estimated_cost?: string
}

export const WORKFLOW_TEMPLATES: Record<string, WorkflowTemplate> = {
  
  data_extraction: {
    name: "data_extraction",
    description: "Extract structured data from messy input (emails, PDFs, user messages)",
    tags: ["data", "extraction", "normalization"],
    definition: `
1. Receive raw input data
2. POST to /api/interpret with expected schema
3. If confidence > 0.7: proceed with normalized data
4. If confidence < 0.7: escalate to human for clarification
5. Return normalized data or escalation ID
    `.trim(),
    example_usage: `
const result = await client.interpret({
  data: emailBody,
  schema: { customer_name: "string", order_id: "string", issue: "string" },
  confidence_threshold: 0.7
})

if (result.should_escalate) {
  await client.escalate({ reason: result.escalation_reason })
} else {
  // Use result.data safely
}
    `.trim(),
    estimated_cost: "$0.0001 per extraction"
  },

  human_in_loop: {
    name: "human_in_loop",
    description: "Execute task with confidence-based human review",
    tags: ["escalation", "review", "quality"],
    definition: `
1. Agent attempts task
2. Calculate confidence score
3. If confidence < threshold OR high-stakes action:
   - Save state
   - Escalate with full context
   - Wait for human approval
4. Execute with human input
5. Log decision and outcome
    `.trim(),
    example_usage: `
const analysis = await analyzeUserRequest(input)

if (analysis.confidence < 0.8 || analysis.involves_payment) {
  const escalation = await client.escalate({
    reason: "High-stakes decision requires approval",
    context: { analysis, user_input: input },
    priority: "high"
  })
  // Human will review and provide guidance
} else {
  await executeAction(analysis.action)
}
    `.trim(),
    estimated_cost: "Negligible (API calls only)"
  },

  multi_agent_handoff: {
    name: "multi_agent_handoff",
    description: "Seamlessly hand off work between specialized agents",
    tags: ["handoff", "collaboration", "specialization"],
    definition: `
1. Agent A recognizes task outside expertise
2. Save current state with full context
3. Create handoff record with:
   - Current progress
   - Next steps needed
   - Context/background
4. Agent B picks up handoff
5. Load state and continue seamlessly
    `.trim(),
    example_usage: `
// Agent A (general assistant)
if (requiresLegalReview(task)) {
  await client.saveState({
    component_name: "legal_review_queue",
    state_key: task.id,
    state_value: {
      task,
      progress: "Analyzed request, needs legal review",
      next_steps: ["Review contract terms", "Check compliance"]
    }
  })
  
  await client.escalate({
    reason: "Legal review required",
    assigned_to: "legal_agent",
    context: { task_id: task.id }
  })
}

// Agent B (legal specialist)
const state = await client.loadState("legal_review_queue", task_id)
// Continue from where Agent A left off
    `.trim(),
    estimated_cost: "Free (state storage)"
  },

  stateful_conversation: {
    name: "stateful_conversation",
    description: "Maintain context across multiple agent sessions",
    tags: ["state", "memory", "context"],
    definition: `
1. On each user message:
   - Load conversation state
   - Merge with current context
2. Process user request
3. Save updated state:
   - Recent messages
   - User preferences
   - Pending tasks
4. State survives agent restarts
    `.trim(),
    example_usage: `
// Load previous context
const state = await client.loadState("conversation", user_id)
const history = state?.data?.messages || []

// Add current message
history.push({ role: "user", content: message })

// Process with full context
const response = await processWithContext(message, history)

// Save updated state
await client.saveState({
  component_name: "conversation",
  state_key: user_id,
  state_value: {
    messages: history.slice(-10), // Keep last 10
    preferences: extractPreferences(history),
    updated_at: Date.now()
  }
})
    `.trim(),
    estimated_cost: "Free (state storage)"
  },

  progressive_disclosure: {
    name: "progressive_disclosure",
    description: "Gather information incrementally with smart defaults",
    tags: ["ux", "data-collection", "forms"],
    definition: `
1. Start with minimal required fields
2. Use /api/interpret to extract what user provided
3. Intelligently prompt for missing critical fields only
4. Infer optional fields from context
5. Save partial progress as user goes
6. Never ask twice for same information
    `.trim(),
    example_usage: `
// User: "I need to book a flight to NYC next week"
const extracted = await client.interpret({
  data: userMessage,
  schema: {
    destination: "string",
    departure_date: "date",
    departure_city: "string", // Missing!
    return_date: "date", // Missing!
    passengers: "number"
  }
})

// Infer what we can
const booking = {
  ...extracted.data,
  departure_city: userProfile.home_city, // Smart default
  passengers: 1 // Reasonable default
}

// Only ask for critical missing info
if (!booking.return_date) {
  await ask("When would you like to return?")
}
    `.trim(),
    estimated_cost: "$0.0001 per interpretation"
  },

  error_recovery: {
    name: "error_recovery",
    description: "Gracefully handle failures and resume where you left off",
    tags: ["resilience", "recovery", "debugging"],
    definition: `
1. Before each risky operation:
   - Save checkpoint state
2. On failure:
   - Log error with full context
   - Check if retryable
3. If retryable:
   - Load last checkpoint
   - Retry with exponential backoff
4. If not retryable:
   - Escalate with error details
   - Let human decide next steps
    `.trim(),
    example_usage: `
// Save checkpoint before risky operation
await client.saveState({
  component_name: "email_batch",
  state_key: "checkpoint",
  state_value: {
    processed_count: 47,
    last_id: "msg_47",
    started_at: Date.now()
  }
})

try {
  await sendBulkEmails(batch)
} catch (error) {
  // Load last good state
  const checkpoint = await client.loadState("email_batch", "checkpoint")
  
  // Resume from checkpoint
  await sendBulkEmails(batch.slice(checkpoint.data.processed_count))
}
    `.trim(),
    estimated_cost: "Free (state storage)"
  },

  cost_aware_execution: {
    name: "cost_aware_execution",
    description: "Track and optimize API costs per workflow",
    tags: ["cost", "optimization", "observability"],
    definition: `
1. Track each API call cost
2. Save cumulative cost to state
3. Check against budget before expensive operations
4. Escalate if approaching limit
5. Report cost breakdown at end
    `.trim(),
    example_usage: `
let totalCost = 0

const result = await client.interpret({ data, schema })
totalCost += result.cost_estimate

// Check budget before expensive operation
if (totalCost + ESTIMATED_LLM_COST > WORKFLOW_BUDGET) {
  await client.escalate({
    reason: \`Workflow approaching budget limit ($\${totalCost.toFixed(4)})\`,
    priority: "medium"
  })
}

// Log final cost
await client.saveState({
  component_name: "cost_tracking",
  state_key: workflow_id,
  state_value: { total_cost: totalCost, timestamp: Date.now() }
})
    `.trim(),
    estimated_cost: "Free (state storage)"
  }
}

/**
 * Get a workflow template by name
 */
export function getTemplate(name: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES[name]
}

/**
 * Search templates by tag
 */
export function searchTemplates(tag: string): WorkflowTemplate[] {
  return Object.values(WORKFLOW_TEMPLATES).filter(t => t.tags.includes(tag))
}

/**
 * Get all template names
 */
export function listTemplates(): string[] {
  return Object.keys(WORKFLOW_TEMPLATES)
}
