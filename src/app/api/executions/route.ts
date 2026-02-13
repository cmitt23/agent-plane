import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/executions - Query workflow executions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const workflow_id = searchParams.get('workflow_id')
    const agent_id = searchParams.get('agent_id')
    const status = searchParams.get('status')
    const limit = searchParams.get('limit') || '50'

    let query = supabase.from('workflow_executions').select(`
      *,
      workflow:workflows(id, name, version, description),
      agent:agents(id, name, framework)
    `)

    if (workflow_id) {
      query = query.eq('workflow_id', workflow_id)
    }
    if (agent_id) {
      query = query.eq('executed_by_agent_id', agent_id)
    }
    if (status) {
      query = query.eq('status', status)
    }

    query = query
      .order('started_at', { ascending: false })
      .limit(parseInt(limit))

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Executions GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/executions - Start a new workflow execution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      workflow_id,
      executed_by_agent_id,
      executed_with_model,
      input_data
    } = body

    if (!workflow_id) {
      return NextResponse.json(
        { error: 'workflow_id is required' },
        { status: 400 }
      )
    }

    // Validate workflow exists
    const { data: workflow, error: workflowError } = await supabase
      .from('workflows')
      .select('id, name')
      .eq('id', workflow_id)
      .single()

    if (workflowError || !workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Validate agent exists if provided
    if (executed_by_agent_id) {
      const { data: agent } = await supabase
        .from('agents')
        .select('id')
        .eq('id', executed_by_agent_id)
        .single()

      if (!agent) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        )
      }
    }

    const { data, error } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id,
        executed_by_agent_id,
        executed_with_model,
        input_data,
        status: 'pending',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    // Log execution start
    await supabase.from('audit_log').insert({
      agent_id: executed_by_agent_id,
      action: 'execution_start',
      resource_type: 'workflow_execution',
      resource_id: data.id,
      details: { workflow_id, workflow_name: workflow.name }
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Executions POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
