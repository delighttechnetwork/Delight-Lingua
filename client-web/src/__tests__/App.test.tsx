import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

test('renders Delight Lingua header', () => {
  render(<App />);
  const linkElement = screen.getByText(/Delight Lingua/i);
  expect(linkElement).toBeInTheDocument();
});
