import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from '@/components/search-bar';

describe('SearchBar', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    mockOnSearch.mockClear();
  });

  it('renders with default props', () => {
    render(<SearchBar onSearch={mockOnSearch} value="" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    expect(input).toBeInTheDocument();
    expect(input).toHaveValue('');
  });

  it('renders with provided value', () => {
    render(<SearchBar onSearch={mockOnSearch} value="test query" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    expect(input).toHaveValue('test query');
  });

  it('calls onSearch when input changes', () => {
    render(<SearchBar onSearch={mockOnSearch} value="" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    fireEvent.change(input, { target: { value: 'new query' } });

    expect(mockOnSearch).toHaveBeenCalledWith('new query');
  });

  it('calls onSearch when input changes with existing value', () => {
    render(<SearchBar onSearch={mockOnSearch} value="old query" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    fireEvent.change(input, { target: { value: 'updated query' } });

    expect(mockOnSearch).toHaveBeenCalledWith('updated query');
  });

  it('has correct accessibility attributes', () => {
    render(<SearchBar onSearch={mockOnSearch} value="" />);

    const input = screen.getByPlaceholderText('Search ingresses...');
    expect(input).toHaveAttribute('type', 'text');
    expect(input).toHaveAttribute('placeholder', 'Search ingresses...');
    expect(input).toHaveClass('flex', 'h-10', 'w-full', 'rounded-md', 'border');
  });
});
