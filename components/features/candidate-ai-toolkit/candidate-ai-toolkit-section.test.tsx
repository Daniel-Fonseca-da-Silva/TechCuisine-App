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
    expect(screen.getByText('items.generateReplies.title')).toBeInTheDocument();
    expect(screen.getByText('items.coverLetter.title')).toBeInTheDocument();
    expect(screen.getByText('items.cvJobMatch.title')).toBeInTheDocument();
    expect(screen.getByText('items.jobAnalysisWithCv.title')).toBeInTheDocument();
  });

  it('renders all four feature descriptions', () => {
    render(<CandidateAiToolkitSection />);
    expect(screen.getByText('items.generateReplies.description')).toBeInTheDocument();
    expect(screen.getByText('items.coverLetter.description')).toBeInTheDocument();
    expect(screen.getByText('items.cvJobMatch.description')).toBeInTheDocument();
    expect(screen.getByText('items.jobAnalysisWithCv.description')).toBeInTheDocument();
  });
});
