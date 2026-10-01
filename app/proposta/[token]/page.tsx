import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { orcamentos } from '@/lib/db/schema'
import { listProposals } from '@/lib/proposals-repo'
import { isShareToken, publicProposal } from '@/lib/share'
import { SharedProposal } from '@/components/quote/shared-proposal'
export const dynamic = 'force-dynamic'
export const metadata = { title: 'Proposta | Orçai', robots: { index: false, follow: false, noarchive: true }, referrer: 'no-referrer' }
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
 const { token } = await params
 if (!isShareToken(token)) notFound()
 const [row] = await db.select({ id: orcamentos.id }).from(orcamentos).where(eq(orcamentos.shareToken, token))
 if (!row) notFound()
 const [proposal] = await listProposals(1, row.id)
 if (!proposal) notFound()
 return <SharedProposal proposal={publicProposal(proposal)} />
}
