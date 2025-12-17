import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('Utils', () => {
  describe('cn (classNames)', () => {
    it('deve combinar classes simples', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('deve ignorar valores falsy', () => {
      const result = cn('class1', undefined, null, false, 'class2')
      expect(result).toBe('class1 class2')
    })

    it('deve lidar com classes condicionais', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base active')
    })

    it('deve mesclar classes Tailwind corretamente', () => {
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toBe('py-1 px-4')
    })

    it('deve retornar string vazia para entrada vazia', () => {
      const result = cn()
      expect(result).toBe('')
    })
  })
})
