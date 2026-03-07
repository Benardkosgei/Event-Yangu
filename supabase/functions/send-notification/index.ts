import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface NotificationRequest {
  user_ids: string[]
  title: string
  message: string
  type: 'task' | 'event' | 'budget' | 'announcement'
  related_id?: string
  related_table?: string
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

    const { user_ids, title, message, type, related_id, related_table }: NotificationRequest = await req.json()

    // Create notifications for multiple users
    const notifications = user_ids.map(user_id => ({
      user_id,
      title,
      message,
      type,
      related_id,
      related_table,
    }))

    const { data, error } = await supabaseClient
      .from('notifications')
      .insert(notifications)

    if (error) {
      console.error('Error creating notifications:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Here you could also integrate with push notification services
    // like Firebase Cloud Messaging, OneSignal, etc.

    return new Response(
      JSON.stringify({ 
        message: 'Notifications sent successfully', 
        count: notifications.length,
        data 
      }),
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