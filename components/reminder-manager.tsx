'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Vehicle, Reminder } from '@/lib/types'
import { CalendarClock, Plus, Trash2, ChevronUp, AlertCircle } from 'lucide-react'
import { format, isPast, isToday, differenceInDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function ReminderManager({
  userId,
  vehicles,
  initialReminders,
}: {
  userId: string
  vehicles: Vehicle[]
  initialReminders: Reminder[]
}) {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const [form, setForm] = useState({
    vehicle_id: vehicles[0]?.id ?? '',
    name: '',
    date: '',
    notes: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.from('reminders').insert({
      user_id: userId,
      vehicle_id: form.vehicle_id,
      name: form.name,
      date: form.date,
      notes: form.notes,
    })

    if (!error) {
      setShowForm(false)
      setForm({
        vehicle_id: vehicles[0]?.id ?? '',
        name: '',
        date: '',
        notes: '',
      })
      router.refresh()
      const { data } = await supabase
        .from('reminders')
        .select('*, vehicle:vehicles(*)')
        .order('date', { ascending: true })
      if (data) setReminders(data)
    }

    setLoading(false)
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const supabase = createClient()
    const { error } = await supabase.from('reminders').delete().eq('id', id)
    if (!error) {
      setReminders((prev) => prev.filter((r) => r.id !== id))
    }
    setDeleting(null)
  }

  function getDateStatus(dateStr: string) {
    const date = new Date(dateStr + 'T12:00:00')
    if (isToday(date)) return { label: 'Hoje', className: 'bg-primary/10 text-primary' }
    if (isPast(date)) return { label: 'Vencido', className: 'bg-destructive/10 text-destructive' }
    const days = differenceInDays(date, new Date())
    if (days <= 7) return { label: `${days}d restantes`, className: 'bg-primary/10 text-primary' }
    return { label: `${days}d restantes`, className: 'bg-secondary text-muted-foreground' }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Lembretes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Revisoes, datas importantes e controle de km</p>
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
          <CalendarClock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Nenhum veiculo cadastrado</p>
          <p className="text-sm text-muted-foreground">
            Cadastre um veiculo primeiro para criar lembretes.
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
              <label className="block text-sm font-medium text-foreground mb-1.5">Nome do lembrete</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="Ex: Troca de oleo, Revisao, IPVA..."
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
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
              <label className="block text-sm font-medium text-foreground mb-1.5">Observacoes</label>
              <input
                type="text"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Opcional"
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-4 w-full sm:w-auto rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Salvando...' : 'Criar lembrete'}
          </button>
        </form>
      )}

      {reminders.length > 0 ? (
        <div className="flex flex-col gap-3">
          {reminders.map((reminder) => {
            const status = getDateStatus(reminder.date)
            const overdue = isPast(new Date(reminder.date + 'T12:00:00')) && !isToday(new Date(reminder.date + 'T12:00:00'))
            return (
              <div
                key={reminder.id}
                className={`rounded-lg border bg-card p-4 ${overdue ? 'border-destructive/30' : 'border-border'}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    {overdue && <AlertCircle className="h-4 w-4 text-destructive shrink-0" />}
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-foreground">{reminder.name}</span>
                        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {reminder.vehicle?.name} &middot;{' '}
                        {format(new Date(reminder.date + 'T12:00:00'), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                      {reminder.notes && (
                        <p className="text-xs text-muted-foreground mt-1 italic">{reminder.notes}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(reminder.id)}
                    disabled={deleting === reminder.id}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1 shrink-0"
                    aria-label="Excluir lembrete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        vehicles.length > 0 && !showForm && (
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-foreground font-medium mb-1">Nenhum lembrete criado</p>
            <p className="text-sm text-muted-foreground">
              Clique em &quot;Novo&quot; para criar lembretes de revisoes e datas importantes.
            </p>
          </div>
        )
      )}
    </div>
  )
}
