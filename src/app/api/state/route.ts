import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/state?component=<name>&key=<key>
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const component = searchParams.get('component')
    const key = searchParams.get('key')

    if (!component) {
      return NextResponse.json(
        { error: 'component parameter is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('component_state')
      .select('*')
      .eq('component_name', component)

    if (key) {
      query = query.eq('state_key', key)
    }

    // Apply .single() only if searching by specific key
    const { data, error } = key ? await query.single() : await query

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json({ data: null }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('State GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/state - Create or update state
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { component, key, value, agent_id, expires_at } = body

    if (!component || !key || value === undefined) {
      return NextResponse.json(
        { error: 'component, key, and value are required' },
        { status: 400 }
      )
    }

    // Upsert (insert or update if exists)
    const { data, error } = await supabase
      .from('component_state')
      .upsert({
        component_name: component,
        state_key: key,
        state_value: value,
        agent_id,
        expires_at
      }, {
        onConflict: 'component_name,state_key'
      })
      .select()
      .single()

    if (error) throw error

    // Log to audit trail
    await supabase.from('audit_log').insert({
      agent_id,
      action: 'state_write',
      resource_type: 'state',
      resource_id: data.id,
      details: { component, key }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error('State POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/state?component=<name>&key=<key>
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const component = searchParams.get('component')
    const key = searchParams.get('key')

    if (!component || !key) {
      return NextResponse.json(
        { error: 'component and key parameters are required' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('component_state')
      .delete()
      .eq('component_name', component)
      .eq('state_key', key)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('State DELETE error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
