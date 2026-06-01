import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app title', () => {
  render(<App />);
  const titleElements = screen.getAllByText(/Delight Lingua/i);
  expect(titleElements.length).toBeGreaterThan(0);
});
