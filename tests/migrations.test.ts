import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { PGlite } from '@electric-sql/pglite'
test('migrações criam tabelas, persistem empresa e proposta, e revogam link', async () => {
 const db = new PGlite()
 try {
  for (const name of ['0001_initial.sql', '0002_company_share.sql']) {
   const sql = await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8')
   await db.exec(sql)
   await db.exec(sql)
  }
  await db.query('INSERT INTO empresa(id,dados) VALUES (1,$1)', [JSON.stringify({ name: 'Empresa teste' })])
  const client = await db.query<{ id: string }>("INSERT INTO clientes(nome) VALUES ('Cliente teste') RETURNING id")
  const proposal = await db.query<{ id: string }>("INSERT INTO orcamentos(numero,cliente_id,empresa_snapshot,share_token) VALUES ('ORC-2026-001',$1,$2,$3) RETURNING id", [client.rows[0].id, JSON.stringify({ name: 'Empresa teste' }), 'a'.repeat(64)])
  await db.query("INSERT INTO itens_orcamento(orcamento_id,descricao,quantidade,valor_unitario_centavos) VALUES ($1,'Pintura',2.5,12345)", [proposal.rows[0].id])
  assert.equal((await db.query('SELECT * FROM itens_orcamento')).rows.length, 1)
  await assert.rejects(db.query("INSERT INTO orcamentos(numero,cliente_id) VALUES ('ORC-2026-001',$1)", [client.rows[0].id]))
  await db.query('UPDATE orcamentos SET share_token=NULL WHERE id=$1', [proposal.rows[0].id])
  assert.equal((await db.query('SELECT id FROM orcamentos WHERE share_token=$1', ['a'.repeat(64)])).rows.length, 0)
 } finally { await db.close() }
})
