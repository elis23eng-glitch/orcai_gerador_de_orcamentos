'use client'

import { useState } from 'react'
import { EMPTY_COMPANY, type Company } from '@/lib/company'
import { CompanyCard } from './company-card'
import useSWR from 'swr'
import { Eye, Loader2, PencilLine, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { clientDisplayName, createEmptyProposal, type Proposal } from '@/lib/quote'
import { ClientCard } from './client-card'
import { PreviewPanel } from './preview-panel'
import { ProposalSidebar } from './proposal-sidebar'
import { ServicesCard } from './services-card'
import { StatusBadge } from './status-badge'
import { TermsCard } from './terms-card'

type View = 'form' | 'preview'

const fetcher = async (url: string): Promise<Proposal[]> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error('Falha ao carregar propostas')
  return res.json()
}

export function QuoteApp({ initialProposals }: { initialProposals: Proposal[] }) {
  const { data: saved = initialProposals, mutate } = useSWR('/api/proposals', fetcher, {
    fallbackData: initialProposals,
  })
  const [draft, setDraft] = useState<Proposal>(
    () => initialProposals[0] ?? createEmptyProposal(initialProposals),
  )
  const { data: company = EMPTY_COMPANY, mutate: mutateCompany } = useSWR<Company>('/api/company', async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Falha ao carregar empresa')
    return res.json()
  })
  const [showCompany, setShowCompany] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<View>('form')

  const isUnsavedNew = !saved.some((p) => p.id === draft.id)
  const proposals = isUnsavedNew
    ? [draft, ...saved]
    : saved.map((p) => (p.id === draft.id ? draft : p))

  const update = (patch: Partial<Proposal>) => {
    setDraft((d) => ({ ...d, ...patch }))
    setDirty(true)
  }

  const confirmDiscard = () =>
    !dirty || window.confirm('Há alterações não salvas nesta proposta. Deseja descartá-las?')

  const handleNew = () => {
    if (!confirmDiscard()) return
    const fresh = createEmptyProposal(saved)
    setDraft(fresh)
    setDirty(true)
    setView('form')
    toast.info(`Novo orçamento ${fresh.number} iniciado`)
  }

  const handleSelect = (id: string) => {
    if (id === draft.id) return
    const found = saved.find((p) => p.id === id)
    if (!found || !confirmDiscard()) return
    setDraft(structuredClone(found))
    setDirty(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const save = async (): Promise<boolean> => {
    if (!draft.client.name.trim()) {
      toast.error(
        draft.client.type === 'PJ'
          ? 'Informe a razão social do cliente antes de salvar.'
          : 'Informe o nome do cliente antes de salvar.',
      )
      setView('form')
      return false
    }
    if (!company.name) { setShowCompany(true); toast.error('Cadastre a empresa antes de salvar.'); return false }
    setSaving(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(body.error ?? 'Erro desconhecido')
      await mutate()
      setDirty(false)
      return true
    } catch (error) {
      toast.error('Não foi possível salvar a proposta', {
        description: error instanceof Error ? error.message : undefined,
      })
      return false
    } finally {
      setSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    if (await save()) toast.success(`Rascunho ${draft.number} salvo no banco de dados`)
  }

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[300px_minmax(0,1fr)]">
      <ProposalSidebar
        proposals={proposals}
        activeId={draft.id}
        unsavedId={isUnsavedNew ? draft.id : undefined}
        onSelect={handleSelect}
        onNew={handleNew}
      />

      <main className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-background/85 px-4 py-3 backdrop-blur sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                Editando proposta
                {dirty && (
                  <span className="inline-flex items-center gap-1 text-amber-700">
                    <span className="size-1.5 rounded-full bg-amber-500" aria-hidden="true" />
                    Alterações não salvas
                  </span>
                )}
              </p>
              <h1 className="truncate text-lg font-semibold tracking-tight">
                {draft.number}
                <span className="font-normal text-muted-foreground">
                  {' · '}
                  {clientDisplayName(draft.client) || 'Novo cliente'}
                </span>
              </h1>
            </div>
            <StatusBadge status={draft.status} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => setShowCompany(!showCompany)}>Cadastrar / editar empresa</Button>
            <Tabs value={view} onValueChange={(v) => setView(v as View)} className="2xl:hidden">
              <TabsList>
                <TabsTrigger value="form">
                  <PencilLine data-icon="inline-start" />
                  Formulário
                </TabsTrigger>
                <TabsTrigger value="preview">
                  <Eye data-icon="inline-start" />
                  Pré-visualização
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" onClick={handleSaveDraft} disabled={saving}>
              {saving ? (
                <Loader2 data-icon="inline-start" className="animate-spin" />
              ) : (
                <Save data-icon="inline-start" />
              )}
              {saving ? 'Salvando...' : 'Salvar Rascunho'}
            </Button>
          </div>
        </header>

        {showCompany && <div className="p-4 sm:p-6"><CompanyCard company={company} onSaved={(value) => { mutateCompany(value, false); setShowCompany(false) }} /></div>}
        <div className="grid gap-6 p-4 sm:p-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,620px)]">
          <div
            className={cn(
              'flex flex-col gap-6 print:hidden',
              view === 'form' ? 'flex' : 'hidden 2xl:flex',
            )}
          >
            <ClientCard
              client={draft.client}
              projectType={draft.projectType}
              onClientChange={(client) => update({ client })}
              onProjectTypeChange={(projectType) => update({ projectType })}
            />
            <ServicesCard
              items={draft.items}
              taxPct={draft.taxPct}
              bdiPct={draft.bdiPct}
              onChange={update}
            />
            <TermsCard proposal={draft} onChange={update} />
          </div>

          <div
            className={cn(
              '2xl:sticky 2xl:top-20 2xl:self-start print:block',
              view === 'preview' ? 'block' : 'hidden 2xl:block',
            )}
          >
            <PreviewPanel key={draft.id} proposal={{ ...draft, company }} onSave={save} saving={saving} />
          </div>
        </div>
      </main>
    </div>
  )
}
