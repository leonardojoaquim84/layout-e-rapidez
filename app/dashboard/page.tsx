import { createClient } from '@/lib/supabase/server'
import { FuelDashboard } from '@/components/fuel-dashboard'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('name')

  const { data: fuelEntries } = await supabase
    .from('fuel_entries')
    .select('*, vehicle:vehicles(*)')
    .order('date', { ascending: false })
    .limit(50)

  return (
    <FuelDashboard
      userId={user!.id}
      vehicles={vehicles ?? []}
      initialEntries={fuelEntries ?? []}
    />
  )
}
