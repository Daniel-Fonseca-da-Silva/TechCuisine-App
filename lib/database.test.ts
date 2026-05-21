import { prisma } from './database'

describe('database', () => {
  it('exports prisma client', () => {
    expect(prisma).toBeDefined()
    expect(typeof prisma).toBe('object')
  })

  it('prisma exposes Beanie-aligned models and client methods', () => {
    expect(prisma).toHaveProperty('users')
    expect(prisma).toHaveProperty('ingredients')
    expect(prisma).toHaveProperty('$connect')
  })
})
