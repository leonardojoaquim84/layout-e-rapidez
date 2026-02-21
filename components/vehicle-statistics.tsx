'use client'

import { useState, useMemo } from 'react'
import type { Vehicle, FuelEntry } from '@/lib/types'
import { BarChart3, TrendingUp, Droplets, DollarSign, Gauge } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function VehicleStatistics({
  vehicles,
  fuelEntries,
}: {
  vehicles: Vehicle[]
  fuelEntries: FuelEntry[]
}) {
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all')

  const filteredEntries = useMemo(() => {
    if (selectedVehicle === 'all') return fuelEntries
    return fuelEntries.filter((e) => e.vehicle_id === selectedVehicle)
  }, [fuelEntries, selectedVehicle])

  const stats = useMemo(() => {
    if (filteredEntries.length === 0) {
      return { totalCost: 0, totalLiters: 0, avgConsumption: 0, avgPricePerLiter: 0, totalKm: 0, entries: 0 }
    }

    const totalCost = filteredEntries.reduce((sum, e) => sum + Number(e.total_cost), 0)
    const totalLiters = filteredEntries.reduce((sum, e) => sum + Number(e.liters), 0)
    const avgPricePerLiter = filteredEntries.reduce((sum, e) => sum + Number(e.price_per_liter), 0) / filteredEntries.length

    // Calculate consumption (km/l) from consecutive entries
    let totalKmDriven = 0
    let totalLitersForConsumption = 0
    const sorted = [...filteredEntries].sort((a, b) => Number(a.odometer) - Number(b.odometer))
    for (let i = 1; i < sorted.length; i++) {
      const kmDiff = Number(sorted[i].odometer) - Number(sorted[i - 1].odometer)
      if (kmDiff > 0 && sorted[i].full_tank) {
        totalKmDriven += kmDiff
        totalLitersForConsumption += Number(sorted[i].liters)
      }
    }

    const avgConsumption = totalLitersForConsumption > 0 ? totalKmDriven / totalLitersForConsumption : 0
    const maxOdometer = sorted.length > 0 ? Number(sorted[sorted.length - 1].odometer) : 0
    const minOdometer = sorted.length > 0 ? Number(sorted[0].odometer) : 0
    const totalKm = maxOdometer - minOdometer

    return { totalCost, totalLiters, avgConsumption, avgPricePerLiter, totalKm, entries: filteredEntries.length }
  }, [filteredEntries])

  const costChartData = useMemo(() => {
    const monthlyMap = new Map<string, number>()
    filteredEntries.forEach((entry) => {
      const month = format(new Date(entry.date + 'T12:00:00'), 'MMM/yy', { locale: ptBR })
      monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + Number(entry.total_cost))
    })
    return Array.from(monthlyMap.entries()).map(([name, total]) => ({ name, total: parseFloat(total.toFixed(2)) }))
  }, [filteredEntries])

  const consumptionChartData = useMemo(() => {
    const sorted = [...filteredEntries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const data: { name: string; kmPerLiter: number }[] = []
    for (let i = 1; i < sorted.length; i++) {
      const kmDiff = Number(sorted[i].odometer) - Number(sorted[i - 1].odometer)
      if (kmDiff > 0 && sorted[i].full_tank) {
        data.push({
          name: format(new Date(sorted[i].date + 'T12:00:00'), 'dd/MM', { locale: ptBR }),
          kmPerLiter: parseFloat((kmDiff / Number(sorted[i].liters)).toFixed(2)),
        })
      }
    }
    return data
  }, [filteredEntries])

  const statCards = [
    { label: 'Total gasto', value: `R$ ${stats.totalCost.toFixed(2)}`, icon: DollarSign },
    { label: 'Total litros', value: `${stats.totalLiters.toFixed(1)} L`, icon: Droplets },
    { label: 'Media km/L', value: stats.avgConsumption > 0 ? `${stats.avgConsumption.toFixed(1)} km/L` : '-', icon: TrendingUp },
    { label: 'Preco medio/L', value: `R$ ${stats.avgPricePerLiter.toFixed(2)}`, icon: Gauge },
  ]

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-foreground">Estatisticas</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Consumo e gastos dos seus veiculos</p>
        </div>
        <select
          value={selectedVehicle}
          onChange={(e) => setSelectedVehicle(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="all">Todos os veiculos</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} - {v.plate}
            </option>
          ))}
        </select>
      </div>

      {fuelEntries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-foreground font-medium mb-1">Sem dados suficientes</p>
          <p className="text-sm text-muted-foreground">
            Registre abastecimentos para visualizar as estatisticas.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            {statCards.map((card) => (
              <div key={card.label} className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <card.icon className="h-4 w-4 text-primary" />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <p className="text-lg font-bold text-foreground">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {costChartData.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Gastos mensais (R$)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={costChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222 47% 7%)',
                        border: '1px solid hsl(217 33% 17%)',
                        borderRadius: '8px',
                        color: 'hsl(210 40% 96%)',
                      }}
                      formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                    />
                    <Bar dataKey="total" fill="hsl(24 95% 53%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {consumptionChartData.length > 0 && (
              <div className="rounded-lg border border-border bg-card p-5">
                <h3 className="text-sm font-semibold text-foreground mb-4">Consumo (km/L)</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={consumptionChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                    <XAxis dataKey="name" tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} />
                    <YAxis tick={{ fill: 'hsl(215 20% 55%)', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(222 47% 7%)',
                        border: '1px solid hsl(217 33% 17%)',
                        borderRadius: '8px',
                        color: 'hsl(210 40% 96%)',
                      }}
                      formatter={(value: number) => [`${value.toFixed(2)} km/L`, 'Consumo']}
                    />
                    <Line type="monotone" dataKey="kmPerLiter" stroke="hsl(24 95% 53%)" strokeWidth={2} dot={{ fill: 'hsl(24 95% 53%)', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {stats.totalKm > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground mb-3">Resumo</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground text-xs">Km percorridos</p>
                  <p className="font-medium text-foreground">{stats.totalKm.toLocaleString('pt-BR')} km</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Abastecimentos</p>
                  <p className="font-medium text-foreground">{stats.entries}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Custo por km</p>
                  <p className="font-medium text-foreground">
                    {stats.totalKm > 0 ? `R$ ${(stats.totalCost / stats.totalKm).toFixed(2)}` : '-'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
