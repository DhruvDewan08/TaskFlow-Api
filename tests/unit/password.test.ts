import { describe, it, expect } from '@jest/globals'
import { hashPassword, verifyPassword } from '../../src/lib/password.js'

describe('password', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('securepassword123')
    expect(hash).not.toBe('securepassword123')
    expect(await verifyPassword('securepassword123', hash)).toBe(true)
    expect(await verifyPassword('wrongpassword', hash)).toBe(false)
  })
})
