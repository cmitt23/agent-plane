import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/agents - List all agents or get by name
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const framework = searchParams.get('framework')
    const status = searchParams.get('status')

    let query = supabase.from('agents').select('*')

    if (name) {
      query = query.eq('name', name).single()
    }
    if (framework) {
      query = query.eq('framework', framework)
    }
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Agents GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/agents - Register a new agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, framework, description, capabilities, config } = body

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    const { data, error} = await supabase
      .from('agents')
      .insert({
        name,
        framework,
        description,
        capabilities,
        config
      })
      .select()
      .single()

    if (error) throw error

    // Log registration
    await supabase.from('audit_log').insert({
      agent_id: data.id,
      action: 'agent_register',
      resource_type: 'agent',
      resource_id: data.id,
      details: { name, framework }
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error('Agents POST error:', error)
    
    // Handle duplicate name
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'Agent with this name already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PATCH /api/agents - Update agent last_seen timestamp
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, status } = body

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      last_seen: new Date().toISOString()
    }

    if (status) {
      updateData.status = status
    }

    const { data, error } = await supabase
      .from('agents')
      .update(updateData)
      .eq('name', name)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Agents PATCH error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
