import test from 'node:test'
import assert from 'node:assert/strict'
import { computeTotals, createEmptyProposal, lineTotal } from '../lib/quote'
import { companySchema } from '../lib/company'
import { proposalSchema } from '../lib/proposal-schema'
import { isShareToken, publicProposal, whatsappUrl } from '../lib/share'
import { createProposalPdf } from '../lib/proposal-pdf'
function sample() {
 const p = createEmptyProposal([])
 p.client.name = 'Maria José'
 p.client.phone = '(31) 99999-1234'
 p.client.document = '123.456.789-00'
 p.client.email = 'maria@example.com'
 p.company = { name: 'Construções Elis', tagline: 'Reformas', cnpj: '', phone: '', email: '', site: '', address: '' }
 p.items = [{ ...p.items[0], service: 'Pintura', quantity: '2,5', unitPriceCents: 12345 }]
 return p
}
test('quantidade decimal, arredondamento em centavos, impostos e BDI', () => {
 const p = sample()
 assert.equal(lineTotal(p.items[0]), 30863)
 assert.deepEqual(computeTotals(p.items, '10', '20'), { subtotal: 30863, taxRate: 10, bdiRate: 20, tax: 3086, bdi: 6173, total: 40122 })
})
test('validação rejeita empresa vazia, preço negativo e cliente sem nome', () => {
 const p = sample()
 assert.equal(proposalSchema.safeParse(p).success, true)
 assert.equal(companySchema.safeParse({ ...p.company, name: '' }).success, false)
 assert.equal(proposalSchema.safeParse({ ...p, client: { ...p.client, name: '' } }).success, false)
 assert.equal(proposalSchema.safeParse({ ...p, date: '2026-02-30' }).success, false)
 assert.equal(proposalSchema.safeParse({ ...p, taxPct: '101' }).success, false)
 assert.equal(proposalSchema.safeParse({ ...p, items: [{ ...p.items[0], quantity: '1,2,3' }] }).success, false)
 assert.equal(proposalSchema.safeParse({ ...p, items: [{ ...p.items[0], unitPriceCents: -1 }] }).success, false)
})
test('WhatsApp inclui link e aceita telefone nacional e com código do país', () => {
 const p = sample(), link = 'https://exemplo.com/proposta/' + 'a'.repeat(64)
 const url = whatsappUrl(p, link)
 assert.ok(url.startsWith('https://wa.me/5531999991234?'))
 assert.ok(decodeURIComponent(url).includes(link))
 p.client.phone = '+55 31 99999-1234'
 assert.equal(whatsappUrl(p, link), url)
 p.client.phone = ''
 assert.throws(() => whatsappUrl(p, link))
})
test('link exige token aleatório e página pública omite documento e contato pessoal', () => {
 assert.equal(isShareToken('a'.repeat(64)), true)
 assert.equal(isShareToken('ORC-2026-001'), false)
 const original = sample(), shared = publicProposal(original)
 assert.equal(shared.client.document, '')
 assert.equal(shared.client.phone, '')
 assert.equal(shared.client.email, '')
 assert.notEqual(original.client.document, '')
})
test('PDF real com múltiplas páginas para 200 serviços e observações longas', async () => {
 const p = sample()
 p.items = Array.from({ length: 200 }, (_, i) => ({ ...p.items[0], id: crypto.randomUUID(), service: `Serviço ${i + 1}: pintura e manutenção de instalações hidráulicas` }))
 p.notes = 'Condições adicionais de execução. '.repeat(60)
 const doc = await createProposalPdf(p)
 assert.ok(doc.getNumberOfPages() > 2)
 const bytes = new Uint8Array(doc.output('arraybuffer'))
 assert.equal(new TextDecoder().decode(bytes.slice(0, 5)), '%PDF-')
})
