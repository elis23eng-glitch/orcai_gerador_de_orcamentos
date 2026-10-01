import { companySchema } from '@/lib/company'
import { getCompany, saveCompany } from '@/lib/company-repo'
export async function GET() {
 try { return Response.json(await getCompany()) }
 catch { return Response.json({ error: 'Não foi possível carregar a empresa.' }, { status: 500 }) }
}
export async function PUT(request: Request) {
 const parsed = companySchema.safeParse(await request.json().catch(() => null))
 if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
 try { await saveCompany(parsed.data); return Response.json(parsed.data) }
 catch { return Response.json({ error: 'Não foi possível salvar a empresa.' }, { status: 500 }) }
}
