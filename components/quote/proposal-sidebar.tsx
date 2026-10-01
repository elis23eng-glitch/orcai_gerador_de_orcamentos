'use client'

import { FilePlus2, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  clientDisplayName,
  formatCurrency,
  formatDate,
  proposalTotal,
  type Proposal,
} from '@/lib/quote'
import { StatusBadge } from './status-badge'

interface ProposalSidebarProps {
  proposals: Proposal[]
  activeId: string
  unsavedId?: string
  onSelect: (id: string) => void
  onNew: () => void
}

export function ProposalSidebar({
  proposals,
  activeId,
  unsavedId,
  onSelect,
  onNew,
}: ProposalSidebarProps) {
  const pipeline = proposals.reduce((s, p) => s + proposalTotal(p), 0)
  const approved = proposals.filter((p) => p.status !== 'pendente').length

  return (
    <aside
      aria-label="Propostas recentes"
      className="flex flex-col gap-5 bg-sidebar p-4 text-sidebar-foreground lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:p-5 print:hidden"
    >
      <div className="flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
          <FileText className="size-5" aria-hidden="true" />
        </div>
        <div className="leading-tight">
          <p className="text-base font-semibold tracking-tight">Orçaí</p>
          <p className="text-xs text-sidebar-foreground/60">
            Propostas para reformas
          </p>
        </div>
      </div>

      <Button
        onClick={onNew}
        size="lg"
        className="h-11 w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
      >
        <FilePlus2 data-icon="inline-start" />
        Novo Orçamento
      </Button>

      <dl className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-sidebar-accent p-3">
          <dt className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
            Em carteira
          </dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">
            {formatCurrency(pipeline)}
          </dd>
        </div>
        <div className="rounded-lg bg-sidebar-accent p-3">
          <dt className="text-[11px] uppercase tracking-wide text-sidebar-foreground/60">
            Fechadas
          </dt>
          <dd className="mt-1 text-sm font-semibold tabular-nums">
            {approved} de {proposals.length}
          </dd>
        </div>
      </dl>

      <div className="flex flex-col gap-2">
        <h2 className="px-1 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60">
          Propostas recentes
        </h2>
        <ul className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
          {proposals.map((p) => {
            const active = p.id === activeId
            return (
              <li key={p.id} className="min-w-64 lg:min-w-0">
                <button
                  type="button"
                  onClick={() => onSelect(p.id)}
                  aria-current={active ? 'true' : undefined}
                  className={cn(
                    'flex w-full flex-col gap-2 rounded-lg border p-3 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
                    active
                      ? 'border-sidebar-primary/40 bg-sidebar-accent'
                      : 'border-sidebar-border hover:bg-sidebar-accent/60',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="flex min-w-0 flex-col">
                      <span className="line-clamp-1 text-sm font-medium">
                        {clientDisplayName(p.client) || 'Cliente sem nome'}
                      </span>
                      {p.id === unsavedId && (
                        <span className="text-[11px] text-sidebar-foreground/60">
                          Rascunho não salvo
                        </span>
                      )}
                    </span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5 text-xs text-sidebar-foreground/60">
                    <span>
                      {p.number} · {formatDate(p.date)}
                    </span>
                    <span className="font-semibold tabular-nums text-sidebar-foreground">
                      {formatCurrency(proposalTotal(p))}
                    </span>
                  </div>
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
