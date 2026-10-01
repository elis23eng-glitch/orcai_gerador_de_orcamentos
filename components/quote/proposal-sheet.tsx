import { EMPTY_COMPANY } from '@/lib/company'
import { Hexagon } from 'lucide-react'
import {
  PROJECT_TYPE_LABELS,
  addDays,
  computeTotals,
  formatCurrency,
  formatDate,
  formatPercent,
  lineTotal,
  parseQuantity,
  type Proposal,
} from '@/lib/quote'

const qty = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export function ProposalSheet({ proposal }: { proposal: Proposal }) {
  const COMPANY = proposal.company ?? EMPTY_COMPANY
  const { client, terms } = proposal
  const isPJ = client.type === 'PJ'
  const items = proposal.items.filter((i) => i.service.trim() || i.unitPriceCents > 0)
  const totals = computeTotals(items, proposal.taxPct, proposal.bdiPct)
  const validity = Number.parseInt(terms.validityDays, 10)
  const validUntil = Number.isFinite(validity) ? formatDate(addDays(proposal.date, validity)) : '—'

  return (
    <article
      id="proposal-sheet"
      aria-label={`Proposta ${proposal.number}`}
      className="mx-auto flex aspect-[210/297] w-full max-w-[640px] flex-col bg-white text-[11px] leading-relaxed text-slate-700 shadow-xl ring-1 ring-slate-200 print:max-w-none print:shadow-none print:ring-0"
    >
      <div className="h-1.5 bg-[#1e2a4a]" />

      <header className="flex items-start justify-between gap-4 px-8 pt-7 pb-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="relative flex size-11 items-center justify-center rounded-md bg-[#1e2a4a] text-white">
            <Hexagon className="size-6" strokeWidth={1.75} aria-hidden="true" />
            <span className="absolute text-[11px] font-bold">{COMPANY.name.charAt(0) || "O"}</span>
          </div>
          <div className="leading-tight">
            <p className="text-base font-bold tracking-tight text-[#1e2a4a]">{COMPANY.name}</p>
            <p className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{COMPANY.tagline}</p>
          </div>
        </div>
        <div className="text-right leading-tight">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Proposta comercial
          </p>
          <p className="mt-1 text-sm font-bold tabular-nums text-[#1e2a4a]">{proposal.number}</p>
          <p className="text-slate-500">Emitida em {formatDate(proposal.date)}</p>
        </div>
      </header>

      <div className="mx-8 border-t border-slate-200 sm:mx-10" />

      <section className="grid grid-cols-2 gap-x-6 gap-y-2 px-8 py-5 sm:px-10" aria-label="Dados do cliente">
        <div className="col-span-2 flex items-center justify-between gap-3">
          <h3 className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1e2a4a]">
            {isPJ ? 'Cliente · Pessoa Jurídica' : 'Cliente · Pessoa Física'}
          </h3>
          <span className="rounded-sm bg-slate-100 px-2 py-0.5 text-[9.5px] font-semibold uppercase tracking-wide text-[#1e2a4a]">
            {PROJECT_TYPE_LABELS[proposal.projectType]}
          </span>
        </div>
        {isPJ ? (
          <>
            <Field label="Razão social" value={client.name} className="col-span-2" />
            <Field label="Nome fantasia" value={client.tradeName} />
            <Field label="CNPJ" value={client.document} />
            <Field label="Inscrição estadual" value={client.stateRegistration} />
            <Field label="Telefone" value={client.phone} />
          </>
        ) : (
          <>
            <Field label="Nome" value={client.name} />
            <Field label="CPF" value={client.document} />
            <Field label="Telefone" value={client.phone} />
          </>
        )}
        <Field label="E-mail" value={client.email} />
        <Field label="Endereço da obra" value={client.address} className="col-span-2" />
      </section>

      <section className="px-8 sm:px-10" aria-label="Serviços">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#1e2a4a] text-left text-[10px] uppercase tracking-wide text-white">
              <th scope="col" className="rounded-l-sm px-2.5 py-2 font-semibold">Descrição do serviço</th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">Qtd.</th>
              <th scope="col" className="px-2 py-2 font-semibold">Un.</th>
              <th scope="col" className="px-2 py-2 text-right font-semibold">Unitário</th>
              <th scope="col" className="rounded-r-sm px-2.5 py-2 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-2.5 py-6 text-center text-slate-400">
                  Nenhum serviço adicionado ainda.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-slate-100 even:bg-slate-50">
                  <td className="px-2.5 py-2 text-slate-800">{item.service || '—'}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{qty.format(parseQuantity(item.quantity))}</td>
                  <td className="px-2 py-2">{item.unit}</td>
                  <td className="px-2 py-2 text-right tabular-nums">{formatCurrency(item.unitPriceCents)}</td>
                  <td className="px-2.5 py-2 text-right font-semibold tabular-nums text-slate-800">
                    {formatCurrency(lineTotal(item))}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="mt-3 flex justify-end">
          <dl className="w-56">
            <div className="flex justify-between px-2.5 py-1">
              <dt className="text-slate-500">Subtotal</dt>
              <dd className="tabular-nums">{formatCurrency(totals.subtotal)}</dd>
            </div>
            {totals.taxRate > 0 && (
              <div className="flex justify-between px-2.5 py-1">
                <dt className="text-slate-500">Impostos ({formatPercent(totals.taxRate)})</dt>
                <dd className="tabular-nums">{formatCurrency(totals.tax)}</dd>
              </div>
            )}
            {totals.bdiRate > 0 && (
              <div className="flex justify-between px-2.5 py-1">
                <dt className="text-slate-500">BDI ({formatPercent(totals.bdiRate)})</dt>
                <dd className="tabular-nums">{formatCurrency(totals.bdi)}</dd>
              </div>
            )}
            <div className="mt-1 flex items-center justify-between rounded-sm bg-[#1e2a4a] px-2.5 py-2 text-white">
              <dt className="text-[10px] font-semibold uppercase tracking-wide">Valor total</dt>
              <dd className="text-sm font-bold tabular-nums">{formatCurrency(totals.total)}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="px-8 pt-6 sm:px-10" aria-label="Condições comerciais">
        <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#1e2a4a]">
          Condições comerciais
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <Term label="Pagamento" value={terms.payment || '—'} />
          <Term label="Prazo de execução" value={terms.deadlineDays ? `${terms.deadlineDays} dias úteis` : '—'} />
          <Term label="Validade" value={`Até ${validUntil}`} />
        </div>
        {proposal.notes.trim() && (
          <p className="mt-3 rounded-sm border-l-2 border-[#1e2a4a] bg-slate-50 px-3 py-2 text-slate-600">
            <span className="font-semibold text-slate-700">Observações: </span>
            {proposal.notes}
          </p>
        )}
      </section>

      <div className="mt-auto grid grid-cols-2 gap-10 px-8 pt-10 pb-6 sm:px-10">
        <Signature label={COMPANY.name} caption="Contratada" />
        <Signature label={client.name || 'Cliente'} caption="Contratante" />
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 bg-[#1e2a4a] px-8 py-3 text-[9.5px] text-white/80 sm:px-10">
        <span>CNPJ {COMPANY.cnpj}</span>
        <span>{COMPANY.phone}</span>
        <span>{COMPANY.email}</span>
        <span>{COMPANY.site}</span>
      </footer>
    </article>
  )
}

function Field({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={className}>
      <p className="text-[9.5px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value || '—'}</p>
    </div>
  )
}

function Term({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm border border-slate-200 px-2.5 py-2">
      <p className="text-[9.5px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 font-medium text-slate-800">{value}</p>
    </div>
  )
}

function Signature({ label, caption }: { label: string; caption: string }) {
  return (
    <div className="text-center">
      <div className="border-t border-slate-300 pt-1.5 font-medium text-slate-700">{label}</div>
      <p className="text-[9.5px] uppercase tracking-wide text-slate-400">{caption}</p>
    </div>
  )
}
