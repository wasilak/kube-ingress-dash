import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import SearchBar from '@/components/search-bar';

const renderWithMantine = (component: React.ReactElement) => {
  return render(<MantineProvider>{component}</MantineProvider>);
};

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders with default props', () => {
    renderWithMantine(<SearchBar onSearch={mockOnSearch} value="" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('renders with provided value', () => {
    renderWithMantine(<SearchBar onSearch={mockOnSearch} value="test query" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    expect(input).toHaveValue('test query');
  });

  it('calls onSearch when input changes', () => {
    renderWithMantine(<SearchBar onSearch={mockOnSearch} value="" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    fireEvent.change(input, { target: { value: 'new query' } });

    expect(mockOnSearch).toHaveBeenCalledWith('new query');
  });

  it('calls onSearch when input changes with existing value', () => {
    renderWithMantine(<SearchBar onSearch={mockOnSearch} value="old query" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    fireEvent.change(input, { target: { value: 'updated query' } });

    expect(mockOnSearch).toHaveBeenCalledWith('updated query');
  });

  it('has correct accessibility attributes', () => {
    renderWithMantine(<SearchBar onSearch={mockOnSearch} value="" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Search ingresses...');
  });
});
