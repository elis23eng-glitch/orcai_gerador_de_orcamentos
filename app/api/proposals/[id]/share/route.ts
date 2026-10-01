import { randomBytes } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { orcamentos } from '@/lib/db/schema'
import { isUUID } from '@/lib/share'
type Context = { params: Promise<{ id: string }> }
export async function POST(_request: Request, context: Context) {
 const { id } = await context.params
 if (!isUUID(id)) return Response.json({ error: 'Identificador inválido.' }, { status: 400 })
 try {
  const [row] = await db.select({ token: orcamentos.shareToken }).from(orcamentos).where(eq(orcamentos.id, id))
  if (!row) return Response.json({ error: 'Proposta não encontrada.' }, { status: 404 })
  const token = row.token ?? randomBytes(32).toString('hex')
  const [updated] = await db.update(orcamentos).set({ shareToken: sql`coalesce(${orcamentos.shareToken}, ${token})` }).where(eq(orcamentos.id, id)).returning({ token: orcamentos.shareToken })
  return Response.json({ path: `/proposta/${updated.token}` })
 } catch { return Response.json({ error: 'Não foi possível compartilhar.' }, { status: 500 }) }
}
export async function DELETE(_request: Request, context: Context) {
 const { id } = await context.params
 if (!isUUID(id)) return Response.json({ error: 'Identificador inválido.' }, { status: 400 })
 try {
  await db.update(orcamentos).set({ shareToken: null }).where(eq(orcamentos.id, id))
  return Response.json({ ok: true })
 } catch { return Response.json({ error: 'Não foi possível desativar o link.' }, { status: 500 }) }
}
