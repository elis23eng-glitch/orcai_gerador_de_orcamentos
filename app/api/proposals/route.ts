import { proposalSchema } from '@/lib/proposal-schema'
import { listProposals, saveProposal } from '@/lib/proposals-repo'

export async function GET() {
  try {
    return Response.json(await listProposals())
  } catch (error) {
    console.error('[orcai] Falha ao listar propostas', error)
    return Response.json({ error: 'Não foi possível carregar as propostas.' }, { status: 500 })
  }
}

function pgErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  const e = error as { code?: string; cause?: { code?: string } }
  return e.code ?? e.cause?.code
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Requisição inválida.' }, { status: 400 })
  }

  const parsed = proposalSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' },
      { status: 400 },
    )
  }

  try {
    const totals = await saveProposal(parsed.data)
    return Response.json({ ok: true, totals })
  } catch (error) {
    if (pgErrorCode(error) === '23505') {
      return Response.json(
        { error: `Já existe uma proposta com o número ${parsed.data.number}.` },
        { status: 409 },
      )
    }
    console.error('[orcai] Falha ao salvar proposta', error)
    return Response.json({ error: 'Não foi possível salvar a proposta.' }, { status: 500 })
  }
}
