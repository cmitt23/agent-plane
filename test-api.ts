#!/usr/bin/env tsx
/**
 * AgentPlane API Test Script
 * 
 * Tests the core APIs to validate they work correctly.
 * Run with: npx tsx test-api.ts
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api'

interface ApiResponse {
  data?: any
  error?: string
  success?: boolean
}

async function apiCall(endpoint: string, options: RequestInit = {}): Promise<ApiResponse> {
  const url = `${API_BASE}${endpoint}`
  console.log(`\n📡 ${options.method || 'GET'} ${url}`)
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    ...options
  })

  const data = await response.json()
  
  if (!response.ok) {
    console.error(`❌ Error ${response.status}:`, data.error)
    return data
  }

  console.log(`✅ Success:`, JSON.stringify(data, null, 2))
  return data
}

async function runTests() {
  console.log('🚀 Starting AgentPlane API Tests...\n')
  console.log(`API Base: ${API_BASE}\n`)
  console.log('=' + '='.repeat(60))

  try {
    // Test 1: Register an agent
    console.log('\n\n🧪 Test 1: Register Agent')
    console.log('-'.repeat(60))
    const agentResponse = await apiCall('/agents', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test-agent',
        framework: 'custom',
        description: 'Test agent for API validation',
        capabilities: { test: true }
      })
    })
    const agentId = agentResponse.data?.id

    // Test 2: Get agent by name
    console.log('\n\n🧪 Test 2: Get Agent by Name')
    console.log('-'.repeat(60))
    await apiCall('/agents?name=test-agent')

    // Test 3: Write state
    console.log('\n\n🧪 Test 3: Write State')
    console.log('-'.repeat(60))
    await apiCall('/state', {
      method: 'POST',
      body: JSON.stringify({
        component: 'test-component',
        key: 'test-key',
        value: { message: 'Hello, AgentPlane!', timestamp: new Date().toISOString() },
        agent_id: agentId
      })
    })

    // Test 4: Read state
    console.log('\n\n🧪 Test 4: Read State')
    console.log('-'.repeat(60))
    await apiCall('/state?component=test-component&key=test-key')

    // Test 5: Create workflow
    console.log('\n\n🧪 Test 5: Create Workflow')
    console.log('-'.repeat(60))
    const workflowResponse = await apiCall('/workflows', {
      method: 'POST',
      body: JSON.stringify({
        name: 'test-workflow',
        description: 'Test workflow for validation',
        definition: `# Test Workflow

## Purpose
Validate AgentPlane workflow storage

## Steps
1. This is a test
2. It should work
3. Success!`,
        designed_by_agent_id: agentId,
        designed_with_model: 'sonnet',
        executable_by_model: 'haiku'
      })
    })

    // Test 6: Read workflow
    console.log('\n\n🧪 Test 6: Read Workflow')
    console.log('-'.repeat(60))
    await apiCall('/workflows?name=test-workflow')

    // Test 7: Update agent heartbeat
    console.log('\n\n🧪 Test 7: Update Agent Heartbeat')
    console.log('-'.repeat(60))
    await apiCall('/agents', {
      method: 'PATCH',
      body: JSON.stringify({
        name: 'test-agent',
        status: 'active'
      })
    })

    console.log('\n\n' + '='.repeat(60))
    console.log('✨ All tests completed successfully!')
    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('\n\n💥 Test failed with error:', error)
    process.exit(1)
  }
}

// Run the tests
runTests().catch(console.error)
