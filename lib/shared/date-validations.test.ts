import { validateDate } from './date-validations'

describe('date-validations', () => {
  const errorMessages = {
    startDateError: 'Start date cannot be in the future',
    endDateError: 'End date cannot be in the future',
  }

  describe('validateDate', () => {
    it('returns undefined for empty dateString', () => {
      expect(
        validateDate('', 'startDate', errorMessages)
      ).toBeUndefined()
      expect(
        validateDate('', 'endDate', errorMessages)
      ).toBeUndefined()
    })

    it('returns startDateError when startDate is today or in future', () => {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      expect(
        validateDate(todayStr, 'startDate', errorMessages)
      ).toBe(errorMessages.startDateError)
    })

    it('returns endDateError when endDate is today or in future', () => {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      expect(
        validateDate(todayStr, 'endDate', errorMessages)
      ).toBe(errorMessages.endDateError)
    })

    it('returns undefined when startDate is in the past', () => {
      const pastDate = '2020-01-15'
      expect(
        validateDate(pastDate, 'startDate', errorMessages)
      ).toBeUndefined()
    })

    it('returns undefined when endDate is in the past', () => {
      const pastDate = '2020-01-15'
      expect(
        validateDate(pastDate, 'endDate', errorMessages)
      ).toBeUndefined()
    })
  })
})
