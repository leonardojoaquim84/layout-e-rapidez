import { createClient } from '@/lib/supabase/server'
import { VehicleManager } from '@/components/vehicle-manager'

export default async function VehiclesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <VehicleManager userId={user!.id} initialVehicles={vehicles ?? []} />
  )
}
