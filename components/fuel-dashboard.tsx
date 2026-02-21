'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Vehicle, FuelEntry } from '@/lib/types'
import { Fuel, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function FuelDashboard({
  userId,
  vehicles,
  initialEntries,
}: {
  userId: string
  vehicles: Vehicle[]
  initialEntries: FuelEntry[]
}) {
  const [entries, setEntries] = useState<FuelEntry[]>(initialEntries)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const [form, setForm] = useState({
    vehicle_id: vehicles[0]?.id ?? '',
    date: new Date().toISOString().split('T')[0],
    odometer: '',
    liters: '',
    price_per_liter: '',
    fuel_type: 'Gasolina',
    full_tank: true,
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const total_cost = parseFloat(form.liters) * parseFloat(form.price_per_liter)

    const { error } = await supabase.from('fuel_entries').insert({
      user_id: userId,
      vehicle_id: form.vehicle_id,
      date: form.date,
      odometer: parseFloat(form.odometer),
      liters: parseFloat(form.liters),
      price_per_liter: parseFloat(form.price_per_liter),
      total_cost,
      fuel_type: form.fuel_type,
      full_tank: form.full_tank,
      notes: form.notes,
    })

    if (!error) {
      setShowForm(false)
      setForm({
        vehicle_id: vehicles[0]?.id ?? '',
        date: new Date().toISOString().split('T')[0],
        odometer: '',
        liters: '',
        price_per_liter: '',
        fuel_type: 'Gasolina',
        full_tank: true,
        notes: '',
      })
      router.refresh()
      // Refetch entries
      const { data } = await supabase
        .from('fuel_entries')
        .select('*, vehicle:vehicles(*)')
        .order('date', { ascending: false })
        .limit(50)
      if (data) setEntries(data)
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('fuel_entries').delete().eq('id', id)
    if (!error) {
      setEntries((prev) => prev.filter((e) => e.id !== id))
    }
    setDeleting(null)
  }

  const totalCost = form.liters && form.price_per_liter
    ? (parseFloat(form.liters) * parseFloat(form.price_per_liter)).toFixed(2)
    : '0.00'

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Abastecimentos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Registre e acompanhe seus abastecimentos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Fechar' : 'Novo'}
        </button>
      </div>

      {vehicles.length === 0 && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Fuel className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Nenhum veiculo cadastrado</p>
          <p className="text-sm text-muted-foreground">
            Cadastre um veiculo primeiro para registrar abastecimentos.
          </p>
        </div>
      )}

      {showForm && vehicles.length > 0 && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Veiculo</label>
              <select
                value={form.vehicle_id}
                onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} - {v.plate}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Data</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Odometro (km)</label>
              <input
                type="number"
                step="0.1"
                value={form.odometer}
                onChange={(e) => setForm({ ...form, odometer: e.target.value })}
                required
                placeholder="Ex: 45000"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Litros</label>
              <input
                type="number"
                step="0.01"
                value={form.liters}
                onChange={(e) => setForm({ ...form, liters: e.target.value })}
                required
                placeholder="Ex: 40.5"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Preco/Litro (R$)</label>
              <input
                type="number"
                step="0.01"
                value={form.price_per_liter}
                onChange={(e) => setForm({ ...form, price_per_liter: e.target.value })}
                required
                placeholder="Ex: 5.89"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Tipo</label>
              <select
                value={form.fuel_type}
                onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Gasolina</option>
                <option>Etanol</option>
                <option>Diesel</option>
                <option>GNV</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="full_tank"
                checked={form.full_tank}
                onChange={(e) => setForm({ ...form, full_tank: e.target.checked })}
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-ring"
              />
              <label htmlFor="full_tank" className="text-sm text-foreground">Tanque cheio</label>
            </div>
            <div className="flex items-center">
              <p className="text-sm text-muted-foreground">
                Total: <span className="text-foreground font-semibold text-base">R$ {totalCost}</span>
              </p>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-foreground mb-1.5">Observacoes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Opcional"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full sm:w-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : 'Registrar abastecimento'}
          </button>
        </form>
      )}

      {entries.length > 0 && (
        <div className="flex flex-col gap-3">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {entry.vehicle?.name ?? 'Veiculo'}
                    </span>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {entry.fuel_type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.date + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  disabled={deleting === entry.id}
                  className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                  aria-label="Excluir abastecimento"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
                <div>
                  <p className="text-xs text-muted-foreground">Odometro</p>
                  <p className="text-sm font-medium text-foreground">{Number(entry.odometer).toLocaleString('pt-BR')} km</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Litros</p>
                  <p className="text-sm font-medium text-foreground">{Number(entry.liters).toFixed(2)} L</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Preco/L</p>
                  <p className="text-sm font-medium text-foreground">R$ {Number(entry.price_per_liter).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-sm font-bold text-primary">R$ {Number(entry.total_cost).toFixed(2)}</p>
                </div>
              </div>
              {entry.notes && (
                <p className="text-xs text-muted-foreground mt-2 italic">{entry.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {entries.length === 0 && vehicles.length > 0 && !showForm && (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Fuel className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Nenhum abastecimento registrado</p>
          <p className="text-sm text-muted-foreground">
            Clique em &quot;Novo&quot; para registrar seu primeiro abastecimento.
          </p>
        </div>
      )}
    </div>
  )
}
