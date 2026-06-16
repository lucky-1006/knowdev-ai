import React from 'react';
import { render, screen } from '@testing-library/react';
import AIToolsPage from '../app/dashboard/tools/page';

// Mock lib/api to prevent fetch calls
jest.mock('../lib/api', () => ({
  apiFetch: jest.fn(),
}));

describe('AIToolsPage Component', () => {
  it('renders the AI Developer Tools page and its header', () => {
    render(<AIToolsPage />);
    
    // Check main headers
    expect(screen.getByText('AI Developer Tools')).toBeInTheDocument();
    expect(screen.getByText(/Optimize coding workflows, map repository layouts/)).toBeInTheDocument();

    // Check tab navigation links
    expect(screen.getByText('Commit Generator')).toBeInTheDocument();
    expect(screen.getByText('Architecture Mapper')).toBeInTheDocument();
    expect(screen.getByText('Sprint Planner')).toBeInTheDocument();
    expect(screen.getByText('Package Scanner')).toBeInTheDocument();

    // Verify initial active tab contents (Commit Generator Diff Input)
    expect(screen.getByText('Git Diff Changes')).toBeInTheDocument();
    expect(screen.getByText('Generated Commit Message')).toBeInTheDocument();
  });
});
