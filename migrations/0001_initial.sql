CREATE TABLE IF NOT EXISTS clientes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), tipo text NOT NULL DEFAULT 'PF', nome text NOT NULL,
 nome_fantasia text NOT NULL DEFAULT '', documento text NOT NULL DEFAULT '', inscricao_estadual text NOT NULL DEFAULT '',
 telefone text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', endereco text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS orcamentos (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), numero text NOT NULL UNIQUE,
 cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE, data date NOT NULL DEFAULT CURRENT_DATE,
 status text NOT NULL DEFAULT 'pendente', tipo_projeto text NOT NULL DEFAULT 'reforma_residencial',
 forma_pagamento text NOT NULL DEFAULT '', prazo_execucao_dias integer, validade_dias integer,
 observacoes text NOT NULL DEFAULT '', subtotal_centavos bigint NOT NULL DEFAULT 0,
 impostos_pct numeric(6,2) NOT NULL DEFAULT 0, bdi_pct numeric(6,2) NOT NULL DEFAULT 0, total_centavos bigint NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS itens_orcamento (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), orcamento_id uuid NOT NULL REFERENCES orcamentos(id) ON DELETE CASCADE,
 posicao integer NOT NULL DEFAULT 0, descricao text NOT NULL DEFAULT '', quantidade numeric(12,2) NOT NULL DEFAULT 0,
 unidade text NOT NULL DEFAULT 'un', valor_unitario_centavos bigint NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS itens_orcamento_proposta_idx ON itens_orcamento(orcamento_id);
