'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Vehicle } from '@/lib/types'
import { Car, Plus, Trash2, Pencil, X, ChevronDown, ChevronUp } from 'lucide-react'

export function VehicleManager({
  userId,
  initialVehicles,
}: {
  userId: string
  initialVehicles: Vehicle[]
}) {
  const [vehicles, setVehicles] = useState<Vehicle[]>(initialVehicles)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const emptyForm = {
    name: '',
    brand: '',
    model: '',
    year: '',
    plate: '',
    fuel_type: 'Gasolina',
  }

  const [form, setForm] = useState(emptyForm)

  function startEdit(vehicle: Vehicle) {
    setForm({
      name: vehicle.name,
      brand: vehicle.brand,
      model: vehicle.model,
      year: vehicle.year?.toString() ?? '',
      plate: vehicle.plate,
      fuel_type: vehicle.fuel_type,
    })
    setEditing(vehicle.id)
    setShowForm(true)
  }

  function cancelForm() {
    setForm(emptyForm)
    setEditing(null)
    setShowForm(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const payload = {
      user_id: userId,
      name: form.name,
      brand: form.brand,
      model: form.model,
      year: form.year ? parseInt(form.year) : null,
      plate: form.plate.toUpperCase(),
      fuel_type: form.fuel_type,
    }

    if (editing) {
      const { error } = await supabase
        .from('vehicles')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', editing)
      if (!error) {
        cancelForm()
        router.refresh()
        const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
        if (data) setVehicles(data)
      }
    } else {
      const { error } = await supabase.from('vehicles').insert(payload)
      if (!error) {
        cancelForm()
        router.refresh()
        const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false })
        if (data) setVehicles(data)
      }
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('vehicles').delete().eq('id', id)
    if (!error) {
      setVehicles((prev) => prev.filter((v) => v.id !== id))
    }
    setDeleting(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Veiculos</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gerencie seus veiculos cadastrados</p>
        </div>
        <button
          onClick={() => showForm ? cancelForm() : setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          {showForm ? <ChevronUp className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? 'Fechar' : 'Novo'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">
              {editing ? 'Editar veiculo' : 'Novo veiculo'}
            </h2>
            {editing && (
              <button
                type="button"
                onClick={cancelForm}
                className="text-muted-foreground hover:text-foreground p-1"
                aria-label="Cancelar edicao"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Ex: Meu Carro"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Marca</label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                placeholder="Ex: Volkswagen"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Modelo</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="Ex: Gol"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ano</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                placeholder="Ex: 2023"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Placa</label>
              <input
                type="text"
                value={form.plate}
                onChange={(e) => setForm({ ...form, plate: e.target.value })}
                required
                placeholder="Ex: ABC1D23"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Combustivel</label>
              <select
                value={form.fuel_type}
                onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option>Gasolina</option>
                <option>Etanol</option>
                <option>Diesel</option>
                <option>Flex</option>
                <option>GNV</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full sm:w-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : editing ? 'Atualizar veiculo' : 'Cadastrar veiculo'}
          </button>
        </form>
      )}

      {vehicles.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {vehicles.map((vehicle) => (
            <div key={vehicle.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <Car className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{vehicle.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {vehicle.brand} {vehicle.model} {vehicle.year ? `(${vehicle.year})` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => startEdit(vehicle)}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1"
                    aria-label="Editar veiculo"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(vehicle.id)}
                    disabled={deleting === vehicle.id}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                    aria-label="Excluir veiculo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>Placa: <span className="text-foreground font-medium">{vehicle.plate || '-'}</span></span>
                <span className="rounded-md bg-secondary px-2 py-0.5 text-xs">{vehicle.fuel_type}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !showForm && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <Car className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Nenhum veiculo cadastrado</p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Novo&quot; para cadastrar seu primeiro veiculo.
            </p>
          </div>
        )
      )}
    </div>
  )
}
