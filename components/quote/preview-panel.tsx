 'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import type { Proposal } from '@/lib/quote'
import { whatsappUrl } from '@/lib/share'
import { downloadProposalPdf } from '@/lib/proposal-pdf'
import { ProposalSheet } from './proposal-sheet'
interface Props { proposal: Proposal; onSave: () => Promise<boolean>; saving: boolean }
export function PreviewPanel({ proposal, onSave, saving }: Props) {
 const [busy, setBusy] = useState(false)
 const [link, setLink] = useState('')
 const [whatsapp, setWhatsapp] = useState('')
 async function act(action: 'pdf' | 'share' | 'revoke') {
  setBusy(true); setLink(''); setWhatsapp('')
  try {
   if (action !== 'revoke' && !await onSave()) return
   if (action === 'pdf') { await downloadProposalPdf(proposal); return }
   const res = await fetch(`/api/proposals/${proposal.id}/share`, { method: action === 'revoke' ? 'DELETE' : 'POST' })
   const data = await res.json()
   if (!res.ok) throw new Error(data.error)
   if (action === 'revoke') { toast.success('Link desativado'); return }
   const url = new URL(data.path, window.location.origin).href
   setLink(url)
   try { setWhatsapp(whatsappUrl(proposal, url)) } catch (error) { toast.info(error instanceof Error ? error.message : 'Confira o telefone.') }
   toast.success('Link de compartilhamento pronto')
  } catch (error) { toast.error(error instanceof Error ? error.message : 'Não foi possível concluir.') }
  finally { setBusy(false) }
 }
 return <div className="flex flex-col gap-4">
  <div className="flex flex-wrap gap-2 print:hidden">
   <Button disabled={saving || busy} onClick={() => act('pdf')}>Baixar PDF</Button>
   <Button disabled={saving || busy} onClick={() => act('share')}>Compartilhar / WhatsApp</Button>
   <Button variant="outline" disabled={saving || busy} onClick={() => act('revoke')}>Desativar link</Button>
  </div>
  {link && <div className="rounded-lg border bg-card p-3 print:hidden">
   <p className="mb-2 text-sm">Quem tiver este link poderá visualizar a proposta. Alterações salvas atualizam a proposta compartilhada.</p>
   <a className="break-all text-sm underline" href={link} target="_blank" rel="noopener noreferrer">{link}</a>
   <div className="mt-3 flex gap-3">
    <Button variant="outline" onClick={() => navigator.clipboard.writeText(link).then(() => toast.success('Link copiado')).catch(() => toast.error('Copie o link acima.'))}>Copiar link</Button>
    {whatsapp && <a className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground" href={whatsapp} target="_blank" rel="noopener noreferrer">Abrir WhatsApp</a>}
   </div>
  </div>}
  <div className="rounded-xl bg-slate-200/70 p-3 sm:p-6 print:bg-transparent print:p-0"><ProposalSheet proposal={proposal} /></div>
 </div>
}
