import Link from 'next/link'
import { Fuel, AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Fuel className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">CarData</h1>
          </div>
          <div className="rounded-full bg-destructive/10 p-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Erro na autenticacao</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ocorreu um erro durante a autenticacao. Tente novamente.
          </p>
        </div>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Voltar para login
        </Link>
      </div>
    </div>
  )
}
