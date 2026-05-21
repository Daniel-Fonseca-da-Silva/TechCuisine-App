import { cn } from './utils'

describe('utils', () => {
  describe('cn', () => {
    it('merges single class', () => {
      expect(cn('foo')).toBe('foo')
    })

    it('merges multiple classes', () => {
      expect(cn('foo', 'bar')).toBe('foo bar')
    })

    it('handles conditional classes', () => {
      expect(cn('base', true && 'active')).toBe('base active')
      expect(cn('base', false && 'active')).toBe('base')
    })

    it('merges tailwind classes and resolves conflicts', () => {
      expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    })

    it('handles undefined and null', () => {
      expect(cn('a', undefined, null, 'b')).toBe('a b')
    })

    it('handles array of classes', () => {
      expect(cn(['foo', 'bar'])).toBe('foo bar')
    })

    it('handles empty input', () => {
      expect(cn()).toBe('')
    })
  })
})
