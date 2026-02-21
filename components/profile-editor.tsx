'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
import { User, Check } from 'lucide-react'

export function ProfileEditor({
  userId,
  email,
  initialProfile,
}: {
  userId: string
  email: string
  initialProfile: Profile
}) {
  const [name, setName] = useState(initialProfile.name)
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        name,
        updated_at: new Date().toISOString(),
      })

    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setLoading(false)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Perfil</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gerencie suas informacoes pessoais</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="rounded-full bg-primary/10 p-3">
            <User className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{name || 'Sem nome'}</p>
            <p className="text-xs text-muted-foreground">{email}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-foreground mb-1.5">
              Nome
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-md rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              disabled
              className="w-full max-w-md rounded-lg border border-border bg-secondary px-3 py-2.5 text-sm text-muted-foreground cursor-not-allowed"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4" />
                  Salvo
                </>
              ) : loading ? (
                'Salvando...'
              ) : (
                'Salvar alteracoes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
