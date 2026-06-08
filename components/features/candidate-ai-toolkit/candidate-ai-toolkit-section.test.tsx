import React from 'react';
import { render, screen } from '@testing-library/react';
import { CandidateAiToolkitSection } from './candidate-ai-toolkit-section';

jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

describe('CandidateAiToolkitSection', () => {
  it('renders the section title and description', () => {
    render(<CandidateAiToolkitSection />);
    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('description')).toBeInTheDocument();
  });

  it('renders all four feature cards', () => {
    render(<CandidateAiToolkitSection />);
    expect(screen.getByText('items.recipeBreakdown.title')).toBeInTheDocument();
    expect(screen.getByText('items.sellingPrice.title')).toBeInTheDocument();
    expect(screen.getByText('items.foodCostCheck.title')).toBeInTheDocument();
    expect(screen.getByText('items.menuMatrix.title')).toBeInTheDocument();
  });

  it('renders all four feature descriptions', () => {
    render(<CandidateAiToolkitSection />);
    expect(screen.getByText('items.recipeBreakdown.description')).toBeInTheDocument();
    expect(screen.getByText('items.sellingPrice.description')).toBeInTheDocument();
    expect(screen.getByText('items.foodCostCheck.description')).toBeInTheDocument();
    expect(screen.getByText('items.menuMatrix.description')).toBeInTheDocument();
  });
});
