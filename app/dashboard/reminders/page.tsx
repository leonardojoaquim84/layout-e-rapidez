import { createClient } from '@/lib/supabase/server'
import { ReminderManager } from '@/components/reminder-manager'

export default async function RemindersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('name')

  const { data: reminders } = await supabase
    .from('reminders')
    .select('*, vehicle:vehicles(*)')
    .order('date', { ascending: true })

  return (
    <ReminderManager
      userId={user!.id}
      vehicles={vehicles ?? []}
      initialReminders={reminders ?? []}
    />
  )
}
