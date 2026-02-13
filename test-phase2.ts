#!/usr/bin/env npx tsx
/**
 * AgentPlane Phase 2 Self-Test
 * 
 * Validates all Phase 2 features:
 * - Execution tracking API
 * - Handoff API
 * - Escalation API
 * 
 * Run: npx tsx test-phase2.ts
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000'

type TestResult = {
  step: string
  status: 'pass' | 'fail'
  message?: string
  data?: any
}

const results: TestResult[] = []

async function apiCall(method: string, path: string, body?: any) {
  const url = `${API_BASE}${path}`
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  }

  if (body) {
    options.body = JSON.stringify(body)
  }

  console.log(`\n${method} ${path}`)
  if (body) console.log('Request:', JSON.stringify(body, null, 2))

  const response = await fetch(url, options)
  const data = await response.json()

  console.log(`Status: ${response.status}`)
  console.log('Response:', JSON.stringify(data, null, 2))

  return { response, data }
}

async function runTest() {
  console.log('='.repeat(80))
  console.log('AgentPlane Phase 2 Self-Test')
  console.log('='.repeat(80))

  let agent1Id: string
  let agent2Id: string
  let workflowId: string
  let executionId: string
  let handoffId: string
  let escalationId: string

  try {
    // ========================================================================
    // Setup: Get or create test agents
    // ========================================================================
    console.log('\n📋 SETUP: Getting test agents...')
    
    let { data: agentsData } = await apiCall('GET', '/api/agents')
    
    if (!agentsData.data || agentsData.data.length < 2) {
      console.log('Not enough agents, creating test agents...')
      
      // Create agent 1
      let { response: r1, data: d1 } = await apiCall('POST', '/api/agents', {
        name: 'test-agent-1',
        framework: 'test',
        description: 'Test agent for Phase 2 validation',
        capabilities: { tasks: ['testing', 'validation'] }
      })
      
      if (r1.status !== 201) {
        throw new Error('Failed to create agent 1')
      }
      agent1Id = d1.data.id

      // Create agent 2
      let { response: r2, data: d2 } = await apiCall('POST', '/api/agents', {
        name: 'test-agent-2',
        framework: 'test',
        description: 'Specialized test agent for handoff validation',
        capabilities: { tasks: ['handoff-testing', 'escalation'] }
      })
      
      if (r2.status !== 201) {
        throw new Error('Failed to create agent 2')
      }
      agent2Id = d2.data.id
    } else {
      agent1Id = agentsData.data[0].id
      agent2Id = agentsData.data[1]?.id || agentsData.data[0].id
    }

    console.log(`✅ Agent 1: ${agent1Id}`)
    console.log(`✅ Agent 2: ${agent2Id}`)

    // ========================================================================
    // Setup: Create or get Phase 2 validation workflow
    // ========================================================================
    console.log('\n📋 SETUP: Getting Phase 2 validation workflow...')
    
    let { response: wfResp, data: wfData } = await apiCall(
      'GET', 
      '/api/workflows?name=phase2-validation'
    )

    if (wfResp.status === 404 || !wfData.data) {
      console.log('Creating Phase 2 validation workflow...')
      
      const fs = require('fs')
      const workflowDef = fs.readFileSync('./workflows/phase2-validation.md', 'utf-8')
      
      let { response: createResp, data: createData } = await apiCall('POST', '/api/workflows', {
        name: 'phase2-validation',
        description: 'End-to-end Phase 2 feature validation',
        definition: workflowDef,
        designed_by_agent_id: agent1Id,
        designed_with_model: 'sonnet',
        executable_by_model: 'haiku'
      })

      if (createResp.status !== 201) {
        throw new Error('Failed to create workflow')
      }
      workflowId = createData.data.id
    } else {
      workflowId = wfData.data.id
    }

    console.log(`✅ Workflow: ${workflowId}`)
    results.push({ step: 'Setup', status: 'pass' })

    // ========================================================================
    // TEST 1: Create Execution
    // ========================================================================
    console.log('\n🧪 TEST 1: Create workflow execution')
    
    const { response: execResp, data: execData } = await apiCall('POST', '/api/executions', {
      workflow_id: workflowId,
      executed_by_agent_id: agent1Id,
      executed_with_model: 'sonnet',
      input_data: {
        test_mode: true,
        phase: 2,
        timestamp: new Date().toISOString()
      }
    })

    if (execResp.status !== 201 || !execData.data?.id) {
      results.push({ step: 'Create Execution', status: 'fail', message: 'Failed to create execution' })
      throw new Error('Failed to create execution')
    }

    executionId = execData.data.id
    results.push({ step: 'Create Execution', status: 'pass', data: { executionId } })

    // ========================================================================
    // TEST 2: Start Execution
    // ========================================================================
    console.log('\n🧪 TEST 2: Start execution (update to running)')
    
    const { response: startResp, data: startData } = await apiCall(
      'PATCH',
      `/api/executions/${executionId}`,
      {
        status: 'running',
        agent_id: agent1Id
      }
    )

    if (startResp.status !== 200 || startData.data?.status !== 'running') {
      results.push({ step: 'Start Execution', status: 'fail' })
      throw new Error('Failed to start execution')
    }

    results.push({ step: 'Start Execution', status: 'pass' })

    // ========================================================================
    // TEST 3: Create Handoff
    // ========================================================================
    console.log('\n🧪 TEST 3: Create agent-to-agent handoff')
    
    const { response: handoffResp, data: handoffData } = await apiCall('POST', '/api/handoffs', {
      from_agent_id: agent1Id,
      to_agent_id: agent2Id,
      workflow_id: workflowId,
      execution_id: executionId,
      context: {
        reason: 'Specialized agent needed for next phase',
        completed_steps: [1, 2],
        next_step: 3,
        data: { validation_passed: true }
      },
      reason: 'Phase 2 validation requires agent specialization'
    })

    if (handoffResp.status !== 201 || !handoffData.data?.id) {
      results.push({ step: 'Create Handoff', status: 'fail' })
      throw new Error('Failed to create handoff')
    }

    handoffId = handoffData.data.id
    results.push({ step: 'Create Handoff', status: 'pass', data: { handoffId } })

    // ========================================================================
    // TEST 4: Accept Handoff
    // ========================================================================
    console.log('\n🧪 TEST 4: Accept handoff (agent 2)')
    
    const { response: acceptResp, data: acceptData } = await apiCall(
      'PATCH',
      `/api/handoffs/${handoffId}`,
      {
        status: 'accepted',
        agent_id: agent2Id
      }
    )

    if (acceptResp.status !== 200 || acceptData.data?.status !== 'accepted') {
      results.push({ step: 'Accept Handoff', status: 'fail' })
      throw new Error('Failed to accept handoff')
    }

    results.push({ step: 'Accept Handoff', status: 'pass' })

    // ========================================================================
    // TEST 5: Create Escalation
    // ========================================================================
    console.log('\n🧪 TEST 5: Create escalation (human-in-the-loop)')
    
    const { response: escResp, data: escData } = await apiCall('POST', '/api/escalations', {
      agent_id: agent2Id,
      workflow_id: workflowId,
      execution_id: executionId,
      reason: 'Test escalation to validate human-in-the-loop',
      context: {
        issue: 'Validating escalation flow',
        options: ['continue', 'abort', 'modify'],
        agent_confidence: 0.65
      },
      priority: 'medium'
    })

    if (escResp.status !== 201 || !escData.data?.id) {
      results.push({ step: 'Create Escalation', status: 'fail' })
      throw new Error('Failed to create escalation')
    }

    escalationId = escData.data.id
    results.push({ step: 'Create Escalation', status: 'pass', data: { escalationId } })

    // ========================================================================
    // TEST 6: Resolve Escalation
    // ========================================================================
    console.log('\n🧪 TEST 6: Resolve escalation (simulate human)')
    
    const { response: resolveResp, data: resolveData } = await apiCall(
      'PATCH',
      `/api/escalations/${escalationId}`,
      {
        status: 'resolved',
        resolution: 'Continue with validation - test approved',
        resolved_by: 'test-harness'
      }
    )

    if (resolveResp.status !== 200 || resolveData.data?.status !== 'resolved') {
      results.push({ step: 'Resolve Escalation', status: 'fail' })
      throw new Error('Failed to resolve escalation')
    }

    results.push({ step: 'Resolve Escalation', status: 'pass' })

    // ========================================================================
    // TEST 7: Complete Handoff
    // ========================================================================
    console.log('\n🧪 TEST 7: Complete handoff')
    
    const { response: compHandoffResp, data: compHandoffData } = await apiCall(
      'PATCH',
      `/api/handoffs/${handoffId}`,
      {
        status: 'completed',
        agent_id: agent2Id
      }
    )

    if (compHandoffResp.status !== 200 || compHandoffData.data?.status !== 'completed') {
      results.push({ step: 'Complete Handoff', status: 'fail' })
      throw new Error('Failed to complete handoff')
    }

    results.push({ step: 'Complete Handoff', status: 'pass' })

    // ========================================================================
    // TEST 8: Complete Execution
    // ========================================================================
    console.log('\n🧪 TEST 8: Complete execution')
    
    const { response: compExecResp, data: compExecData } = await apiCall(
      'PATCH',
      `/api/executions/${executionId}`,
      {
        status: 'completed',
        output_data: {
          phase2_features_validated: [
            'execution_tracking',
            'handoff_workflow',
            'escalation_system'
          ],
          test_status: 'all_passed'
        },
        agent_id: agent2Id
      }
    )

    if (compExecResp.status !== 200 || compExecData.data?.status !== 'completed') {
      results.push({ step: 'Complete Execution', status: 'fail' })
      throw new Error('Failed to complete execution')
    }

    // Verify duration was calculated
    if (!compExecData.data.duration_seconds) {
      results.push({ step: 'Complete Execution', status: 'fail', message: 'Duration not calculated' })
      throw new Error('Duration not calculated')
    }

    results.push({ 
      step: 'Complete Execution', 
      status: 'pass',
      data: { duration: compExecData.data.duration_seconds }
    })

    // ========================================================================
    // TEST 9: Verification Queries
    // ========================================================================
    console.log('\n🧪 TEST 9: Verification queries')
    
    // Verify execution
    const { response: verifyExecResp, data: verifyExecData } = await apiCall(
      'GET',
      `/api/executions/${executionId}`
    )

    if (verifyExecResp.status !== 200) {
      results.push({ step: 'Verify Execution', status: 'fail' })
      throw new Error('Failed to retrieve execution')
    }

    // Verify handoffs
    const { response: verifyHandoffResp, data: verifyHandoffData } = await apiCall(
      'GET',
      `/api/handoffs?execution_id=${executionId}`
    )

    if (verifyHandoffResp.status !== 200 || !verifyHandoffData.data?.length) {
      results.push({ step: 'Verify Handoffs', status: 'fail' })
      throw new Error('Failed to retrieve handoffs')
    }

    // Verify escalations
    const { response: verifyEscResp, data: verifyEscData } = await apiCall(
      'GET',
      `/api/escalations?execution_id=${executionId}`
    )

    if (verifyEscResp.status !== 200 || !verifyEscData.data?.length) {
      results.push({ step: 'Verify Escalations', status: 'fail' })
      throw new Error('Failed to retrieve escalations')
    }

    results.push({ step: 'Verification Queries', status: 'pass' })

  } catch (error: any) {
    console.error('\n❌ TEST FAILED:', error.message)
    
    if (!results.find(r => r.status === 'fail')) {
      results.push({ 
        step: 'Unknown', 
        status: 'fail', 
        message: error.message 
      })
    }
  }

  // ========================================================================
  // Results Summary
  // ========================================================================
  console.log('\n' + '='.repeat(80))
  console.log('TEST RESULTS SUMMARY')
  console.log('='.repeat(80))

  const passed = results.filter(r => r.status === 'pass').length
  const failed = results.filter(r => r.status === 'fail').length
  const total = results.length

  results.forEach(r => {
    const icon = r.status === 'pass' ? '✅' : '❌'
    const msg = r.message ? ` - ${r.message}` : ''
    console.log(`${icon} ${r.step}${msg}`)
  })

  console.log('\n' + '='.repeat(80))
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`)
  
  if (failed === 0) {
    console.log('\n🎉 ALL TESTS PASSED! Phase 2 is complete and validated.')
  } else {
    console.log('\n⚠️  SOME TESTS FAILED. Review errors above.')
  }
  console.log('='.repeat(80))

  process.exit(failed > 0 ? 1 : 0)
}

// Run the test
runTest().catch(error => {
  console.error('Fatal error:', error)
  process.exit(1)
})
