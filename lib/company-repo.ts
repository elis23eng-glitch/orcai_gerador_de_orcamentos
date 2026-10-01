import { eq } from 'drizzle-orm'
import { db } from './db'
import { empresa } from './db/schema'
import { EMPTY_COMPANY, companySchema, type Company } from './company'
export async function getCompany(): Promise<Company> {
 const [row] = await db.select().from(empresa).where(eq(empresa.id, 1))
 return row ? companySchema.parse(row.dados) : EMPTY_COMPANY
}
export async function saveCompany(company: Company) {
 await db.insert(empresa).values({ id: 1, dados: company }).onConflictDoUpdate({ target: empresa.id, set: { dados: company } })
}
