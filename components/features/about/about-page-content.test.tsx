import React from 'react';
import { render, screen } from '@testing-library/react';
import { AboutPageContent } from './about-page-content';

jest.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => {
      const map: Record<string, string> = {
        h1: 'Built from a real kitchen',
        lead: 'This is the lead paragraph.',
        'metadata.description': 'Meta description for SEO.',
        'cta.href': '/auth/register',
        'cta.text': 'Create a Tech Cuisine account',
      };
      return map[key] ?? key;
    };
    (t as typeof t & { raw: (key: string) => unknown }).raw = (key: string) => {
      if (key === 'sections') {
        return [
          {
            title: 'First section',
            paragraphs: ['First body paragraph.'],
          },
        ];
      }
      return [];
    };
    return t;
  },
}));

jest.mock('@/i18n/navigation', () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('AboutPageContent', () => {
  it('renders headline, section body, and CTA link', () => {
    render(<AboutPageContent />);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Built from a real kitchen' })
    ).toBeInTheDocument();
    expect(screen.getByText('This is the lead paragraph.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'First section' })).toBeInTheDocument();
    expect(screen.getByText('First body paragraph.')).toBeInTheDocument();

    const cta = screen.getByRole('link', { name: 'Create a Tech Cuisine account' });
    expect(cta).toHaveAttribute('href', '/auth/register');
  });
});
