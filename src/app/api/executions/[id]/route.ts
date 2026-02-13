import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/executions/:id - Get specific execution
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { data, error } = await supabase
      .from('workflow_executions')
      .select(`
        *,
        workflow:workflows(id, name, version, description, definition),
        agent:agents(id, name, framework)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Execution not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Execution GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/executions/:id - Update execution status
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const body = await request.json()
    const {
      status,
      output_data,
      error_message,
      agent_id
    } = body

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'running', 'completed', 'failed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    // Get current execution to calculate duration
    const { data: current } = await supabase
      .from('workflow_executions')
      .select('started_at, status')
      .eq('id', params.id)
      .single()

    if (!current) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      )
    }

    const updateData: any = { status }

    // Set completed_at and duration for terminal states
    if (status === 'completed' || status === 'failed') {
      const completedAt = new Date()
      updateData.completed_at = completedAt.toISOString()

      const startedAt = new Date(current.started_at)
      const durationMs = completedAt.getTime() - startedAt.getTime()
      updateData.duration_seconds = Math.round(durationMs / 1000)
    }

    if (output_data !== undefined) {
      updateData.output_data = output_data
    }

    if (error_message !== undefined) {
      updateData.error_message = error_message
    }

    const { data, error } = await supabase
      .from('workflow_executions')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // Log execution status change
    await supabase.from('audit_log').insert({
      agent_id,
      action: `execution_${status}`,
      resource_type: 'workflow_execution',
      resource_id: data.id,
      details: { 
        status, 
        duration_seconds: updateData.duration_seconds,
        has_error: !!error_message 
      }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Execution PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
