import React from 'react';
import { render, screen } from '@testing-library/react';
import LoginPage from '../app/login/page';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn((key) => null),
  })),
}));

describe('LoginPage Component', () => {
  it('renders the login page elements correctly', () => {
    render(<LoginPage />);
    
    // Check for title header text
    expect(screen.getByText('knowDev AI')).toBeInTheDocument();
    expect(
      screen.getByText('Sign in to start auditing repositories, generating docs, and reviewing PRs.')
    ).toBeInTheDocument();
    
    // Check for inputs and buttons
    expect(screen.getByPlaceholderText('e.g. developer')).toBeInTheDocument();
    expect(screen.getByText('Sign In with Development Mode')).toBeInTheDocument();
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText('Google')).toBeInTheDocument();
  });
});
