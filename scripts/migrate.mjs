import { Pool } from 'pg'
import { readdir, readFile } from 'node:fs/promises'
if (!process.env.DATABASE_URL) {
 console.error('Migrações não executadas: configure DATABASE_URL em .env.local ou no ambiente. Nenhum banco foi alterado.')
 process.exit(1)
}
const pool = new Pool({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000 })
const client = await pool.connect()
try {
  await client.query('BEGIN')
  await client.query("SELECT pg_advisory_xact_lock(782419)")
  await client.query('CREATE TABLE IF NOT EXISTS orcai_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())')
  const dir = new URL('../migrations/', import.meta.url)
  for (const name of (await readdir(dir)).filter(n => n.endsWith('.sql')).sort()) {
    const existing = await client.query('SELECT name FROM orcai_migrations WHERE name=$1', [name])
    if (existing.rowCount) continue
    await client.query(await readFile(new URL(name, dir), 'utf8'))
    await client.query('INSERT INTO orcai_migrations(name) VALUES ($1)', [name])
    console.log(`Aplicada: ${name}`)
  }
  await client.query('COMMIT')
} catch (error) {
  await client.query('ROLLBACK')
  throw error
} finally { client.release(); await pool.end() }
