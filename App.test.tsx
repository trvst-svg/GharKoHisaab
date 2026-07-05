import React from 'react';
import { render } from '@testing-library/react-native';
import App from './App';

describe('App', () => {
  it('renders correctly', () => {
    // Mock the StatusBar and PropertyScreen since they are part of Expo/navigation
    // We just want to ensure the root App shell mounts.
    const tree = render(<App />);
    expect(tree).toBeDefined();
  });
});
