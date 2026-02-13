/**
 * Example: Email Triage Agent
 * 
 * Automatically categorize and route incoming emails with confidence-based escalation.
 */

import { AgentPlane } from '../src/lib/client'

const client = new AgentPlane()

interface Email {
  id: string
  from: string
  subject: string
  body: string
  received_at: string
}

interface TriageResult {
  category: 'support' | 'sales' | 'billing' | 'spam' | 'other'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  requires_response: boolean
  sentiment: 'positive' | 'neutral' | 'negative'
  key_entities: string[]
}

async function triageEmail(email: Email): Promise<TriageResult | null> {
  console.log(`\n📧 Triaging email ${email.id} from ${email.from}`)
  
  // Step 1: Extract structured data from email
  const interpreted = await client.interpret({
    data: `
      Subject: ${email.subject}
      From: ${email.from}
      Body: ${email.body}
    `,
    schema: {
      category: 'string (support|sales|billing|spam|other)',
      priority: 'string (low|medium|high|urgent)',
      requires_response: 'boolean',
      sentiment: 'string (positive|neutral|negative)',
      key_entities: 'array of strings (names, companies, products mentioned)'
    },
    context: 'This is an incoming email that needs to be triaged and routed to the appropriate team.',
    confidence_threshold: 0.7
  })

  console.log(`📊 Overall confidence: ${interpreted.overall_confidence.toFixed(2)}`)
  console.log(`📋 Extracted data:`, interpreted.data)

  // Step 2: Handle low confidence
  if (interpreted.should_escalate) {
    console.log(`⚠️  Low confidence - escalating to human`)
    
    await client.escalate({
      reason: interpreted.escalation_reason || 'Low confidence in email classification',
      priority: 'medium',
      context: {
        email_id: email.id,
        from: email.from,
        subject: email.subject,
        extracted: interpreted.data,
        confidence_scores: interpreted.confidence,
        missing_fields: interpreted.missing_fields
      }
    })
    
    return null
  }

  // Step 3: Save triage result to state
  await client.saveState({
    component_name: 'email_triage',
    state_key: email.id,
    state_value: {
      ...interpreted.data,
      triaged_at: new Date().toISOString(),
      triaged_with_confidence: interpreted.overall_confidence,
      cost: interpreted.cost_estimate
    },
    expires_in_seconds: 30 * 24 * 60 * 60 // Keep for 30 days
  })

  console.log(`✅ Triaged: ${interpreted.data.category} (${interpreted.data.priority} priority)`)

  // Step 4: Route based on category and priority
  const result = interpreted.data as TriageResult

  if (result.priority === 'urgent' || result.sentiment === 'negative') {
    console.log(`🚨 Routing to urgent queue`)
    await client.executeWorkflow({
      workflow_name: 'urgent_response',
      input_data: { email, triage: result }
    })
  } else {
    console.log(`📮 Routing to ${result.category} team`)
    await client.executeWorkflow({
      workflow_name: `route_to_${result.category}`,
      input_data: { email, triage: result }
    })
  }

  return result
}

// Example usage
const exampleEmail: Email = {
  id: 'email_123',
  from: 'angry.customer@example.com',
  subject: 'URGENT: System down for 2 hours!!!',
  body: `
    This is completely unacceptable. Your system has been down for over 2 hours 
    and we've lost thousands in revenue. We need immediate assistance or we're 
    canceling our enterprise plan. This is the third outage this month!
    
    - Sarah Johnson
    - VP Engineering, Acme Corp
  `,
  received_at: new Date().toISOString()
}

// Run triage
triageEmail(exampleEmail)
  .then(result => {
    if (result) {
      console.log('\n✅ Triage complete:', result)
    } else {
      console.log('\n⏳ Waiting for human review')
    }
  })
  .catch(error => {
    console.error('\n❌ Triage failed:', error)
  })
