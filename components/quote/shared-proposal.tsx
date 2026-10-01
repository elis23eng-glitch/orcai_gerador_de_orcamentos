 'use client'
import { ProposalSheet } from './proposal-sheet'
import { downloadProposalPdf } from '@/lib/proposal-pdf'
import type { Proposal } from '@/lib/quote'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
export function SharedProposal({ proposal }: { proposal: Proposal }) {
 return <main className="min-h-screen bg-slate-100 p-4 sm:p-8">
  <div className="mx-auto mb-4 flex max-w-[640px] justify-between gap-3 print:hidden">
   <h1 className="font-semibold">Proposta {proposal.number}</h1>
   <Button onClick={() => downloadProposalPdf(proposal).catch(() => toast.error('Não foi possível gerar o PDF.'))}>Baixar PDF</Button>
  </div>
  <ProposalSheet proposal={proposal} />
 </main>
}
