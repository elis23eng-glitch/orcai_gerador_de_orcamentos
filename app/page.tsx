import { QuoteApp } from '@/components/quote/quote-app'
import { listProposals } from '@/lib/proposals-repo'
import type { Proposal } from '@/lib/quote'

export const dynamic = 'force-dynamic'

export default async function Page() {
  let initialProposals: Proposal[] = []
  try {
    initialProposals = await listProposals()
  } catch (error) {
    console.error('[orcai] Falha ao carregar propostas iniciais', error)
  }
  return <QuoteApp initialProposals={initialProposals} />
}
