function parseCalendarDate(dateString: string): Date {
  const isoDay = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString)
  if (isoDay) {
    const year = Number(isoDay[1])
    const month = Number(isoDay[2])
    const day = Number(isoDay[3])
    return new Date(year, month - 1, day)
  }
  return new Date(dateString)
}

export function validateDate(
  dateString: string,
  field: 'startDate' | 'endDate',
  errorMessages: {
    startDateError: string
    endDateError: string
  }
): string | undefined {
  if (!dateString) return undefined

  const selectedDate = parseCalendarDate(dateString)
  const now = new Date()
  const today = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  selectedDate.setHours(0, 0, 0, 0)

  if (field === 'startDate') {
    if (selectedDate >= today) {
      return errorMessages.startDateError
    }
  } else if (field === 'endDate') {
    if (selectedDate >= today) {
      return errorMessages.endDateError
    }
  }

  return undefined
}
