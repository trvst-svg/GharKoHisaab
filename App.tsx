import React from 'react';
import { StatusBar } from 'expo-status-bar';
import PropertyScreen from './src/features/property/PropertyScreen';
import AppLockOverlay from './src/components/AppLockOverlay';

export default function App() {
  return (
    <AppLockOverlay>
      <PropertyScreen />
      <StatusBar style="auto" />
    </AppLockOverlay>
  );
}
