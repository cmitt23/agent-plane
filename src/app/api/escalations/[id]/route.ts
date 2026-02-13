import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/escalations/:id - Get specific escalation
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { data, error } = await supabase
      .from('escalations')
      .select(`
        *,
        agent:agents(id, name, framework),
        workflow:workflows(id, name, version, definition),
        execution:workflow_executions(id, status, started_at, completed_at)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Escalation not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Escalation GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/escalations/:id - Update escalation (resolve, dismiss, etc.)
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const body = await request.json()
    const {
      status,
      resolution,
      resolved_by,
      priority
    } = body

    const updateData: any = {}

    if (status) {
      const validStatuses = ['open', 'in_progress', 'resolved', 'dismissed']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.status = status

      if (status === 'resolved' || status === 'dismissed') {
        updateData.resolved_at = new Date().toISOString()
      }
    }

    if (resolution !== undefined) {
      updateData.resolution = resolution
    }

    if (resolved_by !== undefined) {
      updateData.resolved_by = resolved_by
    }

    if (priority) {
      const validPriorities = ['low', 'medium', 'high', 'urgent']
      if (!validPriorities.includes(priority)) {
        return NextResponse.json(
          { error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}` },
          { status: 400 }
        )
      }
      updateData.priority = priority
    }

    const { data, error } = await supabase
      .from('escalations')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Escalation not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Log escalation update
    await supabase.from('audit_log').insert({
      action: 'escalation_update',
      resource_type: 'escalation',
      resource_id: data.id,
      details: { status, resolved_by, priority }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Escalation PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
