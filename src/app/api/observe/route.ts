import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * Observability API - Debug and trace workflow executions
 * 
 * What agents need to know:
 * - What happened?
 * - Why did it fail?
 * - How much did it cost?
 * - What's taking so long?
 */

// GET /api/observe?workflow_id=xxx&execution_id=xxx
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const workflow_id = searchParams.get('workflow_id')
    const execution_id = searchParams.get('execution_id')
    const agent_id = searchParams.get('agent_id')
    const limit = parseInt(searchParams.get('limit') || '50')
    const include_costs = searchParams.get('include_costs') === 'true'

    // Build query based on filters
    let query = supabase
      .from('workflow_executions')
      .select(`
        *,
        workflow:workflows(name, version),
        agent:agents(name, framework)
      `)
      .order('started_at', { ascending: false })
      .limit(limit)

    if (workflow_id) query = query.eq('workflow_id', workflow_id)
    if (execution_id) query = query.eq('id', execution_id)
    if (agent_id) query = query.eq('executed_by_agent_id', agent_id)

    const { data: executions, error } = await query

    if (error) throw error

    // Enrich with audit logs for detailed trace
    const enrichedExecutions = await Promise.all(
      executions.map(async (execution: any) => {
        // Get audit trail for this execution
        const { data: auditLogs } = await supabase
          .from('audit_log')
          .select('*')
          .or(`resource_id.eq.${execution.id},details->>workflow_execution_id.eq.${execution.id}`)
          .order('timestamp', { ascending: true })

        // Calculate actual cost if available
        let actual_cost = execution.cost_estimate
        if (include_costs && auditLogs) {
          actual_cost = auditLogs
            .filter((log: any) => log.details?.cost)
            .reduce((sum: number, log: any) => sum + (log.details.cost || 0), 0)
        }

        return {
          ...execution,
          audit_trail: auditLogs || [],
          actual_cost,
          duration_seconds: execution.duration_seconds || 
            (execution.completed_at 
              ? (new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()) / 1000
              : null
            )
        }
      })
    )

    // Calculate summary stats
    const stats = {
      total_executions: enrichedExecutions.length,
      by_status: enrichedExecutions.reduce((acc: any, ex: any) => {
        acc[ex.status] = (acc[ex.status] || 0) + 1
        return acc
      }, {}),
      total_cost: enrichedExecutions.reduce((sum: number, ex: any) => sum + (ex.actual_cost || 0), 0),
      avg_duration: enrichedExecutions
        .filter((ex: any) => ex.duration_seconds)
        .reduce((sum: number, ex: any, _, arr: any[]) => 
          sum + (ex.duration_seconds / arr.length), 0
        ),
      error_rate: enrichedExecutions.filter((ex: any) => ex.status === 'failed').length / 
                  (enrichedExecutions.length || 1)
    }

    return NextResponse.json({
      executions: enrichedExecutions,
      stats,
      query: { workflow_id, execution_id, agent_id, limit }
    })

  } catch (error) {
    console.error('Observe error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/observe - Log custom observability events
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      execution_id,
      event_type,
      message,
      metadata,
      agent_id
    } = body

    if (!execution_id || !event_type) {
      return NextResponse.json(
        { error: 'execution_id and event_type are required' },
        { status: 400 }
      )
    }

    // Log to audit trail
    const { data, error } = await supabase
      .from('audit_log')
      .insert({
        agent_id,
        action: `observe:${event_type}`,
        resource_type: 'execution',
        resource_id: execution_id,
        details: {
          message,
          metadata,
          timestamp: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })

  } catch (error) {
    console.error('Observe POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
