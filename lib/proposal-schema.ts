import { z } from 'zod'
import { PROJECT_TYPES, STATUSES, UNITS } from './quote'

const text = (max: number) => z.string().trim().max(max)
const numericText = z.string().trim().max(10).regex(/^[\d.,]*$/, 'Valor numérico inválido')

export const proposalSchema = z.object({
  id: z.uuid(),
  number: text(40).min(1, 'Número da proposta obrigatório'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  status: z.enum(STATUSES),
  projectType: z.enum(PROJECT_TYPES),
  client: z.object({
    id: z.uuid(),
    type: z.enum(['PF', 'PJ']),
    name: text(200).min(1, 'Informe o nome do cliente ou a razão social'),
    tradeName: text(200),
    document: text(20),
    stateRegistration: text(30),
    phone: text(20),
    email: text(200),
    address: text(300),
  }),
  items: z
    .array(
      z.object({
        id: z.uuid(),
        service: text(300),
        quantity: numericText,
        unit: z.enum(UNITS),
        unitPriceCents: z.number().int().min(0).max(99_999_999_999),
      }),
    )
    .max(200),
  terms: z.object({
    payment: text(300),
    deadlineDays: z.string().trim().regex(/^\d{0,4}$/, 'Prazo inválido'),
    validityDays: z.string().trim().regex(/^\d{0,4}$/, 'Validade inválida'),
  }),
  taxPct: numericText,
  bdiPct: numericText,
  notes: text(2000),
})

export type ProposalInput = z.infer<typeof proposalSchema>
