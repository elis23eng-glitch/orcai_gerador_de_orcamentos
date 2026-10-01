import test from 'node:test'
import assert from 'node:assert/strict'
import { NextRequest } from 'next/server'
import { proxy } from '../proxy'
test('painel e API exigem senha; link público permanece acessível', () => {
 const oldUser = process.env.ADMIN_USER, oldPassword = process.env.ADMIN_PASSWORD
 process.env.ADMIN_USER = 'admin'; process.env.ADMIN_PASSWORD = 'test-only-password'
 try {
  const request = (path: string, authorization?: string) => new NextRequest(`https://example.com${path}`, { headers: authorization ? { authorization } : {} })
  assert.equal(proxy(request('/')).status, 401)
  assert.equal(proxy(request('/api/proposals')).status, 401)
  assert.equal(proxy(request('/api/company', `Basic ${Buffer.from('admin:wrong').toString('base64')}`)).status, 401)
  assert.equal(proxy(request('/api/proposals', `Basic ${Buffer.from('admin:test-only-password').toString('base64')}`)).status, 200)
  assert.equal(proxy(request('/proposta/' + 'a'.repeat(64))).status, 200)
 } finally {
  if (oldUser === undefined) delete process.env.ADMIN_USER; else process.env.ADMIN_USER = oldUser
  if (oldPassword === undefined) delete process.env.ADMIN_PASSWORD; else process.env.ADMIN_PASSWORD = oldPassword
 }
})
