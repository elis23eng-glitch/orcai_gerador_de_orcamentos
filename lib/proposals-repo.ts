import { asc, desc, eq, inArray } from 'drizzle-orm'
import { db } from './db'
import { clientes, itensOrcamento, orcamentos } from './db/schema'
import type { ProposalInput } from './proposal-schema'
import {
  PROJECT_TYPES,
  STATUSES,
  UNITS,
  computeTotals,
  parsePercent,
  type ClientType,
  type ProjectType,
  type Proposal,
  type ProposalStatus,
  type Unit,
} from './quote'

function numericToInput(value: string) {
  const n = Number(value)
  return Number.isFinite(n) && n !== 0 ? String(n).replace('.', ',') : ''
}

function intOrNull(value: string) {
  const n = Number.parseInt(value, 10)
  return Number.isFinite(n) ? n : null
}

const isOneOf = <T extends string>(list: readonly T[], v: string): v is T =>
  (list as readonly string[]).includes(v)

export async function listProposals(limit = 50): Promise<Proposal[]> {
  const rows = await db
    .select({ o: orcamentos, c: clientes })
    .from(orcamentos)
    .innerJoin(clientes, eq(orcamentos.clienteId, clientes.id))
    .orderBy(desc(orcamentos.data), desc(orcamentos.numero))
    .limit(limit)

  if (rows.length === 0) return []

  const items = await db
    .select()
    .from(itensOrcamento)
    .where(
      inArray(
        itensOrcamento.orcamentoId,
        rows.map((r) => r.o.id),
      ),
    )
    .orderBy(asc(itensOrcamento.posicao))

  const itemsByProposal = new Map<string, Proposal['items']>()
  for (const item of items) {
    const list = itemsByProposal.get(item.orcamentoId) ?? []
    list.push({
      id: item.id,
      service: item.descricao,
      quantity: String(Number(item.quantidade)),
      unit: (isOneOf(UNITS, item.unidade) ? item.unidade : 'un') as Unit,
      unitPriceCents: item.valorUnitarioCentavos,
    })
    itemsByProposal.set(item.orcamentoId, list)
  }

  return rows.map(({ o, c }) => ({
    id: o.id,
    number: o.numero,
    date: o.data,
    status: (isOneOf(STATUSES, o.status) ? o.status : 'pendente') as ProposalStatus,
    projectType: (isOneOf(PROJECT_TYPES, o.tipoProjeto)
      ? o.tipoProjeto
      : 'reforma_residencial') as ProjectType,
    client: {
      id: c.id,
      type: (c.tipo === 'PJ' ? 'PJ' : 'PF') as ClientType,
      name: c.nome,
      tradeName: c.nomeFantasia,
      document: c.documento,
      stateRegistration: c.inscricaoEstadual,
      phone: c.telefone,
      email: c.email,
      address: c.endereco,
    },
    items: itemsByProposal.get(o.id) ?? [],
    terms: {
      payment: o.formaPagamento,
      deadlineDays: o.prazoExecucaoDias?.toString() ?? '',
      validityDays: o.validadeDias?.toString() ?? '',
    },
    taxPct: numericToInput(o.impostosPct),
    bdiPct: numericToInput(o.bdiPct),
    notes: o.observacoes,
  }))
}

export async function saveProposal(input: ProposalInput) {
  const items = input.items.filter((i) => i.service || i.unitPriceCents > 0)
  const totals = computeTotals(items, input.taxPct, input.bdiPct)
  const isPJ = input.client.type === 'PJ'
  const now = new Date()

  const clientValues = {
    tipo: input.client.type,
    nome: input.client.name,
    nomeFantasia: isPJ ? input.client.tradeName : '',
    documento: input.client.document,
    inscricaoEstadual: isPJ ? input.client.stateRegistration : '',
    telefone: input.client.phone,
    email: input.client.email,
    endereco: input.client.address,
  }

  const proposalValues = {
    numero: input.number,
    clienteId: input.client.id,
    data: input.date,
    status: input.status,
    tipoProjeto: input.projectType,
    formaPagamento: input.terms.payment,
    prazoExecucaoDias: intOrNull(input.terms.deadlineDays),
    validadeDias: intOrNull(input.terms.validityDays),
    observacoes: input.notes,
    subtotalCentavos: totals.subtotal,
    impostosPct: parsePercent(input.taxPct).toFixed(2),
    bdiPct: parsePercent(input.bdiPct).toFixed(2),
    totalCentavos: totals.total,
  }

  await db.transaction(async (tx) => {
    await tx
      .insert(clientes)
      .values({ id: input.client.id, ...clientValues })
      .onConflictDoUpdate({ target: clientes.id, set: { ...clientValues, updatedAt: now } })

    await tx
      .insert(orcamentos)
      .values({ id: input.id, ...proposalValues })
      .onConflictDoUpdate({ target: orcamentos.id, set: { ...proposalValues, updatedAt: now } })

    await tx.delete(itensOrcamento).where(eq(itensOrcamento.orcamentoId, input.id))

    if (items.length > 0) {
      await tx.insert(itensOrcamento).values(
        items.map((item, index) => ({
          id: item.id,
          orcamentoId: input.id,
          posicao: index,
          descricao: item.service,
          quantidade: (Number.parseFloat(item.quantity.replace(',', '.')) || 0).toFixed(2),
          unidade: item.unit,
          valorUnitarioCentavos: item.unitPriceCents,
        })),
      )
    }
  })

  return totals
}
