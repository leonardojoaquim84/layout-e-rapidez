import { createClient } from '@/lib/supabase/server'
import { VehicleStatistics } from '@/components/vehicle-statistics'

export default async function StatisticsPage() {
  const supabase = await createClient()

  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .order('name')

  const { data: fuelEntries } = await supabase
    .from('fuel_entries')
    .select('*, vehicle:vehicles(*)')
    .order('date', { ascending: true })

  return (
    <VehicleStatistics
      vehicles={vehicles ?? []}
      fuelEntries={fuelEntries ?? []}
    />
  )
}
