import { languageOptions, getLanguageOption, type LanguageOption } from './language-flag'

jest.mock('country-flag-icons/react/3x2', () => ({
  GB: function MockGB() {
    return null
  },
  PT: function MockPT() {
    return null
  },
}))

describe('language-flag', () => {
  const expectedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
  ]

  describe('languageOptions', () => {
    it('has exactly two language options', () => {
      expect(languageOptions).toHaveLength(2)
    })

    it('each option has code, name and flag', () => {
      languageOptions.forEach((option: LanguageOption) => {
        expect(option).toHaveProperty('code')
        expect(option).toHaveProperty('name')
        expect(option).toHaveProperty('flag')
        expect(typeof option.flag).toBe('function')
      })
    })

    it('contains expected language codes and names', () => {
      expectedLanguages.forEach(({ code, name }, index) => {
        expect(languageOptions[index].code).toBe(code)
        expect(languageOptions[index].name).toBe(name)
      })
    })
  })

  describe('getLanguageOption', () => {
    it('returns option for valid code (en)', () => {
      const option = getLanguageOption('en')
      expect(option).toBeDefined()
      expect(option?.code).toBe('en')
      expect(option?.name).toBe('English')
    })

    it('returns option for valid code (pt)', () => {
      const option = getLanguageOption('pt')
      expect(option).toBeDefined()
      expect(option?.code).toBe('pt')
      expect(option?.name).toBe('Português')
    })

    it('returns undefined for unknown code', () => {
      expect(getLanguageOption('xx')).toBeUndefined()
      expect(getLanguageOption('')).toBeUndefined()
    })

    it('is case-sensitive', () => {
      expect(getLanguageOption('EN')).toBeUndefined()
      expect(getLanguageOption('Pt')).toBeUndefined()
    })
  })
})
