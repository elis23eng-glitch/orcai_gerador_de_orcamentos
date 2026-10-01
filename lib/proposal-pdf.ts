import { EMPTY_COMPANY } from './company'
import { addDays, clientDisplayName, computeTotals, formatCurrency, formatDate, lineTotal, type Proposal } from './quote'
export async function createProposalPdf(proposal: Proposal) {
 const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')])
 const doc = new jsPDF()
 const company = proposal.company ?? EMPTY_COMPANY
 let y = 18
 const text = (value: string, size = 10) => {
  doc.setFontSize(size)
  const lines = doc.splitTextToSize(value, 178) as string[]
  for (const line of lines) {
   if (y > 275) { doc.addPage(); y = 18 }
   doc.text(line, 16, y); y += size * 0.5 + 1
  }
 }
 text(company.name || 'Empresa', 18)
 text(company.tagline)
 text([company.cnpj, company.phone, company.email, company.site, company.address].filter(Boolean).join(' | '))
 y += 5
 text(`Proposta ${proposal.number} • ${formatDate(proposal.date)}`, 13)
 text(`Cliente: ${clientDisplayName(proposal.client)}`)
 if (proposal.client.document) text(`CPF/CNPJ: ${proposal.client.document}`)
 text(`Obra: ${proposal.client.address || 'Não informado'}`)
 const items = proposal.items.filter(i => i.service.trim() || i.unitPriceCents > 0)
 autoTable(doc, {
  startY: y + 4, margin: { left: 16, right: 16, top: 18, bottom: 20 },
  head: [['Serviço', 'Quantidade', 'Un.', 'Unitário', 'Total']],
  body: items.map(i => [i.service, i.quantity, i.unit, formatCurrency(i.unitPriceCents), formatCurrency(lineTotal(i))]),
  styles: { fontSize: 9, overflow: 'linebreak' }, headStyles: { fillColor: [30, 42, 74] },
  columnStyles: { 0: { cellWidth: 75 }, 3: { halign: 'right' }, 4: { halign: 'right' } },
 })
 y = (doc as typeof doc & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10
 const totals = computeTotals(items, proposal.taxPct, proposal.bdiPct)
 text(`Subtotal: ${formatCurrency(totals.subtotal)}`)
 text(`Impostos (${totals.taxRate}%): ${formatCurrency(totals.tax)}`)
 text(`BDI (${totals.bdiRate}%): ${formatCurrency(totals.bdi)}`)
 text(`TOTAL: ${formatCurrency(totals.total)}`, 14)
 y += 4
 text(`Pagamento: ${proposal.terms.payment || 'A combinar'}`)
 text(`Prazo de execução: ${proposal.terms.deadlineDays || 'A combinar'}${proposal.terms.deadlineDays ? ' dias úteis' : ''}`)
 const validity = Number.parseInt(proposal.terms.validityDays, 10)
 text(`Validade: ${Number.isFinite(validity) ? formatDate(addDays(proposal.date, validity)) : 'A combinar'}`)
 if (proposal.notes) text(`Observações: ${proposal.notes}`)
 y += 10
 text(`Contratada: ${company.name}`)
 text(`Contratante: ${proposal.client.name}`)
 const pages = doc.getNumberOfPages()
 for (let page = 1; page <= pages; page++) {
  doc.setPage(page); doc.setFontSize(8); doc.text(`Orçai | ${proposal.number} | ${page}/${pages}`, 16, 289)
 }
 return doc
}

export async function downloadProposalPdf(proposal: Proposal) {
 const doc = await createProposalPdf(proposal)
 doc.save(`${proposal.number.replace(/[^a-z0-9_-]/gi, '_')}.pdf`)
}
