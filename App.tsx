import React from 'react';
import { StatusBar } from 'expo-status-bar';
import PropertyScreen from './src/features/property/PropertyScreen';
import AppLockOverlay from './src/components/AppLockOverlay';
import { ThemeProvider } from './src/context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <AppLockOverlay>
        <PropertyScreen />
        <StatusBar style="auto" />
      </AppLockOverlay>
    </ThemeProvider>
  );
}
