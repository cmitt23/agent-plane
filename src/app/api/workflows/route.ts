import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/workflows - List workflows or get specific workflow
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const name = searchParams.get('name')
    const version = searchParams.get('version')
    const active_only = searchParams.get('active_only') === 'true'

    let query = supabase.from('workflows').select('*')
    let shouldReturnSingle = false

    if (name) {
      query = query.eq('name', name)
      shouldReturnSingle = true
      
      if (version) {
        query = query.eq('version', parseInt(version))
      } else {
        // Get latest version by default
        query = query.order('version', { ascending: false }).limit(1)
      }
    }

    if (active_only) {
      query = query.eq('is_active', true)
    }

    const { data, error } = shouldReturnSingle ? await query.single() : await query

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ data: null }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Workflows GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/workflows - Create a new workflow
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      version,
      description,
      definition,
      designed_by_agent_id,
      designed_with_model,
      executable_by_model,
      metadata
    } = body

    if (!name || !definition) {
      return NextResponse.json(
        { error: 'name and definition are required' },
        { status: 400 }
      )
    }

    // Auto-increment version if not provided
    let nextVersion = version || 1
    if (!version) {
      const { data: existing } = await supabase
        .from('workflows')
        .select('version')
        .eq('name', name)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (existing) {
        nextVersion = existing.version + 1
      }
    }

    const { data, error } = await supabase
      .from('workflows')
      .insert({
        name,
        version: nextVersion,
        description,
        definition,
        designed_by_agent_id,
        designed_with_model,
        executable_by_model,
        metadata
      })
      .select()
      .single()

    if (error) throw error

    // Log workflow creation
    await supabase.from('audit_log').insert({
      agent_id: designed_by_agent_id,
      action: 'workflow_create',
      resource_type: 'workflow',
      resource_id: data.id,
      details: { name, version: nextVersion }
    })

    return NextResponse.json({ data }, { status: 201 })
  } catch (error: any) {
    console.error('Workflows POST error:', error)
    
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'Workflow with this name and version already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
