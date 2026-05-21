import React from 'react'
import { render } from '@testing-library/react'
import { SetDocumentLocale } from './set-document-locale'

describe('SetDocumentLocale', () => {
  it('sets document.documentElement.lang to locale', () => {
    render(<SetDocumentLocale locale="pt" />)
    expect(document.documentElement.lang).toBe('pt')
  })

  it('returns null', () => {
    const { container } = render(<SetDocumentLocale locale="en" />)
    expect(container.firstChild).toBeNull()
  })

  it('updates lang when locale prop changes', () => {
    const { rerender } = render(<SetDocumentLocale locale="en" />)
    expect(document.documentElement.lang).toBe('en')
    rerender(<SetDocumentLocale locale="pt" />)
    expect(document.documentElement.lang).toBe('pt')
  })
})
