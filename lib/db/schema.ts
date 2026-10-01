import type { Company } from '../company'
import { bigint, jsonb, date, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const clientes = pgTable('clientes', {
  id: uuid('id').primaryKey().defaultRandom(),
  tipo: text('tipo').notNull().default('PF'),
  nome: text('nome').notNull(),
  nomeFantasia: text('nome_fantasia').notNull().default(''),
  documento: text('documento').notNull().default(''),
  inscricaoEstadual: text('inscricao_estadual').notNull().default(''),
  telefone: text('telefone').notNull().default(''),
  email: text('email').notNull().default(''),
  endereco: text('endereco').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const orcamentos = pgTable('orcamentos', {
  id: uuid('id').primaryKey().defaultRandom(),
  empresaSnapshot: jsonb('empresa_snapshot').$type<Company>(),
  shareToken: text('share_token').unique(),
  numero: text('numero').notNull().unique(),
  clienteId: uuid('cliente_id')
    .notNull()
    .references(() => clientes.id, { onDelete: 'cascade' }),
  data: date('data', { mode: 'string' }).notNull().defaultNow(),
  status: text('status').notNull().default('pendente'),
  tipoProjeto: text('tipo_projeto').notNull().default('reforma_residencial'),
  formaPagamento: text('forma_pagamento').notNull().default(''),
  prazoExecucaoDias: integer('prazo_execucao_dias'),
  validadeDias: integer('validade_dias'),
  observacoes: text('observacoes').notNull().default(''),
  subtotalCentavos: bigint('subtotal_centavos', { mode: 'number' }).notNull().default(0),
  impostosPct: numeric('impostos_pct', { precision: 6, scale: 2 }).notNull().default('0'),
  bdiPct: numeric('bdi_pct', { precision: 6, scale: 2 }).notNull().default('0'),
  totalCentavos: bigint('total_centavos', { mode: 'number' }).notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const itensOrcamento = pgTable('itens_orcamento', {
  id: uuid('id').primaryKey().defaultRandom(),
  orcamentoId: uuid('orcamento_id')
    .notNull()
    .references(() => orcamentos.id, { onDelete: 'cascade' }),
  posicao: integer('posicao').notNull().default(0),
  descricao: text('descricao').notNull().default(''),
  quantidade: numeric('quantidade', { precision: 12, scale: 2 }).notNull().default('0'),
  unidade: text('unidade').notNull().default('un'),
  valorUnitarioCentavos: bigint('valor_unitario_centavos', { mode: 'number' }).notNull().default(0),
})

export const empresa = pgTable('empresa', { id: integer('id').primaryKey(), dados: jsonb('dados').$type<Company>().notNull() })
