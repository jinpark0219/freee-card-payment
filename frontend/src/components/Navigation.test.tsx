import { render, screen } from '@testing-library/react';
import Navigation from './Navigation';

// Mock next/link
jest.mock('next/link', () => {
  return function MockLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

describe('Navigation', () => {
  it('renders navigation links', () => {
    render(<Navigation />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Cards')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
    expect(screen.getByText('Approvals')).toBeInTheDocument();
    expect(screen.getByText('Budgets')).toBeInTheDocument();
  });

  it('renders navigation links with correct hrefs', () => {
    render(<Navigation />);
    
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: 'Cards' })).toHaveAttribute('href', '/cards');
    expect(screen.getByRole('link', { name: 'Transactions' })).toHaveAttribute('href', '/transactions');
  });
});