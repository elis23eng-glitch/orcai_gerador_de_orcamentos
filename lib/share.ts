import { clientDisplayName, formatCurrency, proposalTotal, type Proposal } from './quote'
export const isUUID = (value: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
export const isShareToken = (value: string) => /^[0-9a-f]{64}$/.test(value)
export function whatsappUrl(p: Proposal, link: string) {
 let digits = p.client.phone.replace(/\D/g, '')
 if (digits.length === 10 || digits.length === 11) digits = `55${digits}`
 if (!/^55\d{10,11}$/.test(digits)) throw new Error('Informe o telefone do cliente com DDD.')
 const message = `Olá, ${clientDisplayName(p.client)}! Segue a proposta ${p.number} da ${p.company?.name || 'nossa empresa'}, no valor de ${formatCurrency(proposalTotal(p))}. Você pode visualizar e baixar o PDF aqui: ${link}`
 return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}
export function publicProposal(p: Proposal): Proposal {
 return { ...p, client: { ...p.client, document: '', stateRegistration: '', phone: '', email: '' } }
}
