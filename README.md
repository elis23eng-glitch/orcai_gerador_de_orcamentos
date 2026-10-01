# Orçai — Gerador de Orçamentos

Aplicação para pequenos construtores e profissionais autônomos elaborarem propostas de obras e reformas. Desenvolvida com Next.js, React, TypeScript, Tailwind CSS, PostgreSQL e Drizzle ORM.

## Funcionalidades

- Cadastro da empresa emissora, clientes PF/PJ, serviços, impostos, BDI e condições comerciais.
- Salvamento de propostas no PostgreSQL, com dados da empresa registrados em cada salvamento.
- PDF para download com paginação automática.
- Link público com token aleatório, botão para desativá-lo e mensagem de WhatsApp contendo o link.
- Painel protegido por usuário e senha em produção.

## Executar localmente

Requisitos: Node.js 24, pnpm na versão indicada em `package.json` e PostgreSQL 15 ou superior.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
# Preencha DATABASE_URL, ADMIN_USER e ADMIN_PASSWORD em .env.local.
pnpm db:migrate
pnpm dev
```

No PowerShell, use `Copy-Item .env.example .env.local` no lugar de `cp`.
Acesse http://localhost:3000, clique em **Cadastrar / editar empresa** e salve os dados antes de emitir propostas.

As migrações SQL ficam em `migrations/`; o comando registra as versões aplicadas e executa novas migrações em uma transação. Não usa Drizzle Kit. Faça backup do banco antes de migrar um ambiente existente. As migrações iniciais permitem tabelas já criadas, desde que tenham o mesmo esquema definido em `lib/db/schema.ts`.

## Publicação

Configure `DATABASE_URL`, `ADMIN_USER` e uma `ADMIN_PASSWORD` longa no provedor de hospedagem; use HTTPS. Execute as migrações apontando para o banco do ambiente antes de disponibilizar esta versão. Em produção, o painel responde 503 se as credenciais administrativas não estiverem configuradas. O navegador solicitará usuário e senha via autenticação HTTP Basic. Em desenvolvimento, credenciais vazias permitem acesso local.

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm start
```

## PDF e compartilhamento

1. Cadastre a empresa e preencha o orçamento.
2. **Baixar PDF** salva a proposta e baixa o arquivo real.
3. **Compartilhar / WhatsApp** salva e cria um link. Clique em **Abrir WhatsApp** para revisar e enviar a mensagem.
4. **Desativar link** revoga o acesso. Compartilhar novamente cria um novo link após a revogação.

O WhatsApp recebe o link, sem anexar automaticamente o PDF. O cliente pode baixar o PDF na página compartilhada. Quem tiver o link pode visualizar a proposta, incluindo nome e endereço da obra; CPF/CNPJ do cliente, telefone, inscrição estadual e e-mail são omitidos nessa página. Alterações salvas atualizam a proposta compartilhada. A troca dos dados da empresa só atualiza propostas quando elas são salvas novamente.

## Verificação

O GitHub Actions executa instalação, TypeScript, testes e build. Os testes cobrem cálculos em centavos, validação, links, remoção de contato pessoal da versão pública, PDF com 200 serviços e migrações em PostgreSQL embarcado (PGlite). A conexão ao banco de produção e a entrega da mensagem no WhatsApp dependem da configuração do ambiente.

## Escopo atual

MVP para uma empresa por instalação, com um acesso administrativo. Ainda não inclui contas por usuário, múltiplas empresas, assinatura eletrônica ou pagamentos. Os números de orçamento são sequenciais a partir das propostas carregadas; conflitos são rejeitados pelo banco. O projeto não declara licença de redistribuição.
