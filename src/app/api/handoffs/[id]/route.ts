import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/handoffs/:id - Get specific handoff
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const { data, error } = await supabase
      .from('handoffs')
      .select(`
        *,
        from_agent:agents!handoffs_from_agent_id_fkey(id, name, framework),
        to_agent:agents!handoffs_to_agent_id_fkey(id, name, framework),
        workflow:workflows(id, name, version, definition)
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Handoff not found' },
          { status: 404 }
        )
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Handoff GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/handoffs/:id - Update handoff status
export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params
    const body = await request.json()
    const { status, agent_id, output_data } = body

    if (!status) {
      return NextResponse.json(
        { error: 'status is required' },
        { status: 400 }
      )
    }

    // Validate status transition
    const validStatuses = ['pending', 'accepted', 'rejected', 'completed']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    const updateData: any = { status }

    if (status === 'accepted') {
      updateData.accepted_at = new Date().toISOString()
    }

    if (status === 'completed') {
      updateData.completed_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('handoffs')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Handoff not found' },
          { status: 404 }
        )
      }
      throw error
    }

    // Log handoff status change
    await supabase.from('audit_log').insert({
      agent_id,
      action: `handoff_${status}`,
      resource_type: 'handoff',
      resource_id: data.id,
      details: { status, output_data }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Handoff PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
