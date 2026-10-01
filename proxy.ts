import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'node:crypto'
function equal(a: string, b: string) {
 const x = Buffer.from(a), y = Buffer.from(b)
 return x.length === y.length && timingSafeEqual(x, y)
}
export function proxy(request: NextRequest) {
 const path = request.nextUrl.pathname
 if (path.startsWith('/proposta/')) return NextResponse.next()
 const user = process.env.ADMIN_USER, password = process.env.ADMIN_PASSWORD
 if (!user || !password) {
  if (process.env.NODE_ENV === 'production') return new NextResponse('Configure ADMIN_USER e ADMIN_PASSWORD para acessar o painel.', { status: 503 })
  return NextResponse.next()
 }
 const header = request.headers.get('authorization') ?? ''
 let credentials = ''
 if (header.startsWith('Basic ')) credentials = Buffer.from(header.slice(6), 'base64').toString('utf8')
 const separator = credentials.indexOf(':')
 if (separator >= 0 && equal(credentials.slice(0, separator), user) && equal(credentials.slice(separator + 1), password)) return NextResponse.next()
 return new NextResponse('Acesso restrito', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="Orcai", charset="UTF-8"', 'Cache-Control': 'no-store' } })
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|icon|apple-icon|placeholder).*)'] }
