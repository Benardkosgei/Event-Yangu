import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface EventReportRequest {
  event_id: string
  include_budget?: boolean
  include_tasks?: boolean
  include_members?: boolean
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { event_id, include_budget = true, include_tasks = true, include_members = true }: EventReportRequest = await req.json()

    // Get event details
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('*')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const report: any = {
      event,
      generated_at: new Date().toISOString(),
    }

    // Get event members if requested
    if (include_members) {
      const { data: members } = await supabaseClient
        .from('event_members')
        .select(`
          *,
          users(name, email, phone)
        `)
        .eq('event_id', event_id)

      report.members = members
      report.member_count = members?.length || 0
    }

    // Get tasks if requested
    if (include_tasks) {
      const { data: tasks } = await supabaseClient
        .from('tasks')
        .select(`
          *,
          task_assignments(
            user_id,
            users(name, email)
          )
        `)
        .eq('event_id', event_id)

      report.tasks = tasks
      report.task_summary = {
        total: tasks?.length || 0,
        completed: tasks?.filter(t => t.status === 'completed').length || 0,
        in_progress: tasks?.filter(t => t.status === 'in_progress').length || 0,
        pending: tasks?.filter(t => t.status === 'pending').length || 0,
      }
    }

    // Get budget information if requested
    if (include_budget) {
      const { data: budget } = await supabaseClient
        .from('budgets')
        .select(`
          *,
          budget_categories(*),
          expenses(*)
        `)
        .eq('event_id', event_id)
        .single()

      if (budget) {
        const totalExpenses = budget.expenses?.reduce((sum: number, exp: any) => sum + parseFloat(exp.amount), 0) || 0
        
        report.budget = {
          ...budget,
          total_expenses: totalExpenses,
          remaining_budget: parseFloat(budget.total_budget) - totalExpenses,
          utilization_percentage: ((totalExpenses / parseFloat(budget.total_budget)) * 100).toFixed(2)
        }
      }
    }

    return new Response(
      JSON.stringify(report),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})