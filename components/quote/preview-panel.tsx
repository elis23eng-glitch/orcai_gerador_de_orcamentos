'use client'

import { useState } from 'react'
import { Loader2, Printer, Send } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  COMPANY,
  clientDisplayName,
  formatCurrency,
  proposalTotal,
  type Proposal,
} from '@/lib/quote'
import { ProposalSheet } from './proposal-sheet'

function buildWhatsAppUrl(p: Proposal) {
  const digits = p.client.phone.replace(/\D/g, '')
  const display = clientDisplayName(p.client)
  const firstName = (p.client.type === 'PJ' ? display : display.split(' ')[0]) || 'tudo bem'
  const message = [
    `Olá, ${firstName}! Aqui é da ${COMPANY.name}.`,
    `Segue a proposta ${p.number} para a sua obra, no valor total de ${formatCurrency(proposalTotal(p))}.`,
    p.terms.payment && `Pagamento: ${p.terms.payment}.`,
    p.terms.deadlineDays && `Prazo de execução: ${p.terms.deadlineDays} dias úteis.`,
    'O PDF completo segue em anexo. Qualquer dúvida, estou à disposição!',
  ]
    .filter(Boolean)
    .join('\n')
  const phone = digits ? `55${digits}` : ''
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

interface PreviewPanelProps {
  proposal: Proposal
  onSave: () => Promise<boolean>
  saving: boolean
}

export function PreviewPanel({ proposal, onSave, saving }: PreviewPanelProps) {
  const [generating, setGenerating] = useState(false)
  const busy = generating || saving

  const handleGenerate = async () => {
    setGenerating(true)
    const saved = await onSave()
    if (!saved) {
      setGenerating(false)
      return
    }
    window.setTimeout(() => {
      setGenerating(false)
      const url = buildWhatsAppUrl(proposal)
      toast.success(`Proposta ${proposal.number} salva e gerada`, {
        description: `PDF pronto · ${formatCurrency(proposalTotal(proposal))}`,
        action: {
          label: 'Abrir WhatsApp',
          onClick: () => window.open(url, '_blank', 'noopener,noreferrer'),
        },
        duration: 8000,
      })
    }, 800)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h2 className="text-sm font-semibold">Pré-visualização</h2>
          <p className="text-xs text-muted-foreground">Folha A4 atualizada em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => window.print()} aria-label="Imprimir proposta">
            <Printer />
          </Button>
          <Button size="lg" onClick={handleGenerate} disabled={busy} className="h-10 px-4 shadow-md">
            {generating ? (
              <Loader2 data-icon="inline-start" className="animate-spin" />
            ) : (
              <Send data-icon="inline-start" />
            )}
            {generating ? 'Gerando PDF...' : 'Gerar PDF / Enviar WhatsApp'}
          </Button>
        </div>
      </div>
      <div className="rounded-xl bg-slate-200/70 p-3 sm:p-6 print:bg-transparent print:p-0">
        <ProposalSheet proposal={proposal} />
      </div>
    </div>
  )
}
