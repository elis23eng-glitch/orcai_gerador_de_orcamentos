 'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import type { Company } from '@/lib/company'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
const labels: Record<keyof Company, string> = { name: 'Nome / razão social', tagline: 'Descrição da empresa', cnpj: 'CPF / CNPJ', phone: 'Telefone', email: 'E-mail', site: 'Site', address: 'Endereço' }
export function CompanyCard({ company, onSaved }: { company: Company; onSaved: (value: Company) => void }) {
 const [draft, setDraft] = useState(company)
 const [busy, setBusy] = useState(false)
 async function save() {
  setBusy(true)
  try {
   const res = await fetch('/api/company', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(draft) })
   const data = await res.json()
   if (!res.ok) throw new Error(data.error)
   onSaved(data); toast.success('Empresa cadastrada')
  } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível salvar.') }
  finally { setBusy(false) }
 }
 return <section className="rounded-xl border bg-card p-5 print:hidden">
  <h2 className="mb-3 font-semibold">Empresa que emite o orçamento</h2>
  <div className="grid gap-3 sm:grid-cols-2">{(Object.keys(labels) as (keyof Company)[]).map(key =>
   <label key={key} className="text-sm">{labels[key]}<Input value={draft[key]} type={key === 'email' ? 'email' : 'text'} onChange={e => setDraft({ ...draft, [key]: e.target.value })} /></label>
  )}</div>
  <Button className="mt-4" disabled={busy} onClick={save}>{busy ? 'Salvando...' : 'Salvar empresa'}</Button>
 </section>
}
