export type Vehicle = {
  id: string
  user_id: string
  name: string
  brand: string
  model: string
  year: number | null
  plate: string
  fuel_type: string
  created_at: string
  updated_at: string
}

export type FuelEntry = {
  id: string
  user_id: string
  vehicle_id: string
  date: string
  odometer: number
  liters: number
  price_per_liter: number
  total_cost: number
  fuel_type: string
  full_tank: boolean
  notes: string
  created_at: string
  vehicle?: Vehicle
}

export type Reminder = {
  id: string
  user_id: string
  vehicle_id: string
  name: string
  date: string
  notes: string
  created_at: string
  vehicle?: Vehicle
}

export type Profile = {
  id: string
  name: string
  created_at: string
  updated_at: string
}
