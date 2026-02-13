import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/handoffs - Query handoffs
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const from_agent = searchParams.get('from_agent')
    const to_agent = searchParams.get('to_agent')
    const status = searchParams.get('status')
    const workflow_id = searchParams.get('workflow_id')

    let query = supabase.from('handoffs').select(`
      *,
      from_agent:agents!handoffs_from_agent_id_fkey(id, name, framework),
      to_agent:agents!handoffs_to_agent_id_fkey(id, name, framework),
      workflow:workflows(id, name, version)
    `)

    if (from_agent) {
      query = query.eq('from_agent_id', from_agent)
    }
    if (to_agent) {
      query = query.eq('to_agent_id', to_agent)
    }
    if (status) {
      query = query.eq('status', status)
    }
    if (workflow_id) {
      query = query.eq('workflow_id', workflow_id)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Handoffs GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/handoffs - Create a handoff
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      from_agent_id,
      to_agent_id,
      workflow_id,
      execution_id,
      context,
      reason
    } = body

    if (!context) {
      return NextResponse.json(
        { error: 'context is required' },
        { status: 400 }
      )
    }

    // Validate agents exist
    if (from_agent_id) {
      const { data: fromAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('id', from_agent_id)
        .single()

      if (!fromAgent) {
        return NextResponse.json(
          { error: 'from_agent_id does not exist' },
          { status: 400 }
        )
      }
    }

    if (to_agent_id) {
      const { data: toAgent } = await supabase
        .from('agents')
        .select('id')
        .eq('id', to_agent_id)
        .single()

      if (!toAgent) {
        return NextResponse.json(
          { error: 'to_agent_id does not exist' },
          { status: 400 }
        )
      }
    }

    const { data, error } = await supabase
      .from('handoffs')
      .insert({
        from_agent_id,
        to_agent_id,
        workflow_id,
        execution_id,
        context,
        reason,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Log handoff creation
    await supabase.from('audit_log').insert({
      agent_id: from_agent_id,
      action: 'handoff_create',
      resource_type: 'handoff',
      resource_id: data.id,
      details: { to_agent_id, workflow_id, reason }
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Handoffs POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
