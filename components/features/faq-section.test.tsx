import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { FaqSection } from './faq-section'

const mockItems = [
  { question: 'Question 1', answer: 'Answer 1' },
  { question: 'Question 2', answer: 'Answer 2' },
  { question: 'Question 3', answer: 'Answer 3' },
]

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    ;(t as unknown as { raw: (k: string) => unknown }).raw = () => mockItems
    return t
  },
}))

jest.mock('react-icons/fi', () => ({
  FiChevronDown: ({ className, 'aria-hidden': ariaHidden }: { className?: string; 'aria-hidden'?: string }) => (
    <svg className={className} aria-hidden={ariaHidden} data-testid="chevron-icon" />
  ),
}))

describe('FaqSection', () => {
  it('renders the section title and subtitle', () => {
    render(<FaqSection />)
    expect(screen.getByText('title')).toBeInTheDocument()
    expect(screen.getByText('subtitle')).toBeInTheDocument()
  })

  it('renders all FAQ questions', () => {
    render(<FaqSection />)
    expect(screen.getByText('Question 1')).toBeInTheDocument()
    expect(screen.getByText('Question 2')).toBeInTheDocument()
    expect(screen.getByText('Question 3')).toBeInTheDocument()
  })

  it('opens the first item by default', () => {
    render(<FaqSection />)
    expect(screen.getByText('Answer 1')).toBeInTheDocument()
  })

  it('does not show other answers by default', () => {
    render(<FaqSection />)
    expect(screen.queryByText('Answer 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Answer 3')).not.toBeInTheDocument()
  })

  it('opens an item when its button is clicked', () => {
    render(<FaqSection />)
    fireEvent.click(screen.getByRole('button', { name: /Question 2/i }))
    expect(screen.getByText('Answer 2')).toBeInTheDocument()
  })

  it('closes the first item when clicking it again', () => {
    render(<FaqSection />)
    fireEvent.click(screen.getByRole('button', { name: /Question 1/i }))
    expect(screen.queryByText('Answer 1')).not.toBeInTheDocument()
  })

  it('closes previously open item when another is opened', () => {
    render(<FaqSection />)
    fireEvent.click(screen.getByRole('button', { name: /Question 2/i }))
    expect(screen.queryByText('Answer 1')).not.toBeInTheDocument()
    expect(screen.getByText('Answer 2')).toBeInTheDocument()
  })

  it('sets aria-expanded correctly on buttons', () => {
    render(<FaqSection />)
    const button1 = screen.getByRole('button', { name: /Question 1/i })
    const button2 = screen.getByRole('button', { name: /Question 2/i })
    expect(button1).toHaveAttribute('aria-expanded', 'true')
    expect(button2).toHaveAttribute('aria-expanded', 'false')
  })

  it('updates aria-expanded when toggling items', () => {
    render(<FaqSection />)
    const button2 = screen.getByRole('button', { name: /Question 2/i })
    fireEvent.click(button2)
    expect(button2).toHaveAttribute('aria-expanded', 'true')
    const button1 = screen.getByRole('button', { name: /Question 1/i })
    expect(button1).toHaveAttribute('aria-expanded', 'false')
  })

  it('each button has aria-controls matching its content panel id', () => {
    render(<FaqSection />)
    const buttons = screen.getAllByRole('button')
    buttons.forEach((button, index) => {
      expect(button).toHaveAttribute('aria-controls', `faq-item-${index}`)
    })
  })

  it('each content panel has the correct id', () => {
    render(<FaqSection />)
    mockItems.forEach((_, index) => {
      expect(document.getElementById(`faq-item-${index}`)).toBeInTheDocument()
    })
  })
})
