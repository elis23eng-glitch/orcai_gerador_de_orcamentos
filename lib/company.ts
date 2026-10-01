import { z } from 'zod'
export const companySchema = z.object({
 name: z.string().trim().min(1, 'Informe o nome da empresa').max(200),
 tagline: z.string().trim().max(200), cnpj: z.string().trim().max(20),
 phone: z.string().trim().max(30), email: z.union([z.literal(''), z.email()]),
 site: z.string().trim().max(200), address: z.string().trim().max(300),
})
export type Company = z.infer<typeof companySchema>
export const EMPTY_COMPANY: Company = { name: '', tagline: '', cnpj: '', phone: '', email: '', site: '', address: '' }
