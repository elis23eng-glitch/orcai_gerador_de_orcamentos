import type { Company } from './company'
export type ProposalStatus = 'pendente' | 'aprovado' | 'concluido'
export const STATUSES = ['pendente', 'aprovado', 'concluido'] as const

export const UNITS = ['m²', 'un', 'metros', 'dias', 'vb'] as const
export type Unit = (typeof UNITS)[number]

export type ClientType = 'PF' | 'PJ'

export const PROJECT_TYPES = [
  'reforma_residencial',
  'pequena_construcao',
  'reforma_comercial',
  'manutencao_predial',
] as const
export type ProjectType = (typeof PROJECT_TYPES)[number]

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  reforma_residencial: 'Reforma Residencial',
  pequena_construcao: 'Pequena Construção',
  reforma_comercial: 'Reforma Comercial',
  manutencao_predial: 'Manutenção Predial',
}

export const SERVICE_SUGGESTIONS = [
  'Pintura',
  'Alvenaria',
  'Elétrica',
  'Revestimento',
  'Hidráulica',
  'Gesso / Drywall',
  'Demolição',
  'Impermeabilização',
  'Marcenaria',
  'Limpeza pós-obra',
]

export const PAYMENT_SUGGESTIONS = [
  '50% de sinal + 50% na entrega',
  '30% sinal + 40% meio da obra + 30% entrega',
  'À vista com 5% de desconto',
  'Parcelado em 3x sem juros',
  'Pix na conclusão de cada etapa',
]

export const STATUS_META: Record<ProposalStatus, { label: string; className: string }> = {
  pendente: {
    label: 'Pendente',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  aprovado: {
    label: 'Aprovado',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
  },
  concluido: {
    label: 'Concluído',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
}

export interface ServiceItem {
  id: string
  service: string
  quantity: string
  unit: Unit
  unitPriceCents: number
}

export interface Client {
  id: string
  type: ClientType
  name: string
  tradeName: string
  document: string
  stateRegistration: string
  phone: string
  email: string
  address: string
}

export interface Proposal {
  company?: Company
  id: string
  number: string
  date: string
  status: ProposalStatus
  projectType: ProjectType
  client: Client
  items: ServiceItem[]
  terms: {
    payment: string
    deadlineDays: string
    validityDays: string
  }
  taxPct: string
  bdiPct: string
  notes: string
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
const pct = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 })

export function formatCurrency(cents: number) {
  return brl.format(cents / 100)
}

export function formatPercent(value: number) {
  return `${pct.format(value)}%`
}

export function parseCurrencyInput(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 11)
  return digits ? Number.parseInt(digits, 10) : 0
}

export function maskPhone(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  if (d.length === 0) return ''
  if (d.length <= 2) return `(${d}`
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export function maskCPF(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

export function maskCNPJ(raw: string) {
  const d = raw.replace(/\D/g, '').slice(0, 14)
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

export function sanitizePercentInput(raw: string) {
  const cleaned = raw.replace(/[^\d,.]/g, '').replace('.', ',')
  const [int = '', ...rest] = cleaned.split(',')
  const dec = rest.join('').slice(0, 2)
  const intPart = int.slice(0, 3)
  return cleaned.includes(',') ? `${intPart},${dec}` : intPart
}

export function parsePercent(v: string) {
  const n = Number.parseFloat(v.replace(',', '.'))
  return Number.isFinite(n) ? Math.min(Math.max(n, 0), 100) : 0
}

export function parseQuantity(q: string) {
  const n = Number.parseFloat(q.replace(',', '.'))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function lineTotal(item: Pick<ServiceItem, 'quantity' | 'unitPriceCents'>) {
  return Math.round(parseQuantity(item.quantity) * item.unitPriceCents)
}

export function computeTotals(
  items: Pick<ServiceItem, 'quantity' | 'unitPriceCents'>[],
  taxPct: string,
  bdiPct: string,
) {
  const subtotal = items.reduce((sum, i) => sum + lineTotal(i), 0)
  const taxRate = parsePercent(taxPct)
  const bdiRate = parsePercent(bdiPct)
  const tax = Math.round((subtotal * taxRate) / 100)
  const bdi = Math.round((subtotal * bdiRate) / 100)
  return { subtotal, taxRate, bdiRate, tax, bdi, total: subtotal + tax + bdi }
}

export function proposalTotals(p: Proposal) {
  return computeTotals(p.items, p.taxPct, p.bdiPct)
}

export function proposalTotal(p: Proposal) {
  return proposalTotals(p).total
}

export function clientDisplayName(c: Client) {
  return c.type === 'PJ' ? c.tradeName || c.name : c.name
}

export function formatDate(iso: string) {
  return new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

export function newId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

export function createEmptyItem(): ServiceItem {
  return { id: newId(), service: '', quantity: '1', unit: 'm²', unitPriceCents: 0 }
}

export function createEmptyProposal(existing: Proposal[]): Proposal {
  const year = new Date().getFullYear()
  const max = existing.reduce((m, p) => {
    const n = Number.parseInt(p.number.split('-').pop() ?? '0', 10)
    return Number.isFinite(n) ? Math.max(m, n) : m
  }, 0)
  return {
    id: newId(),
    number: `ORC-${year}-${String(max + 1).padStart(3, '0')}`,
    date: new Date().toISOString().slice(0, 10),
    status: 'pendente',
    projectType: 'reforma_residencial',
    client: {
      id: newId(),
      type: 'PF',
      name: '',
      tradeName: '',
      document: '',
      stateRegistration: '',
      phone: '',
      email: '',
      address: '',
    },
    items: [createEmptyItem()],
    terms: { payment: '', deadlineDays: '', validityDays: '15' },
    taxPct: '',
    bdiPct: '',
    notes: '',
  }
}
