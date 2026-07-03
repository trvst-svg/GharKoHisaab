import React from 'react';
import { StatusBar } from 'expo-status-bar';
import PropertyScreen from './src/features/property/PropertyScreen';

export default function App() {
  return (
    <>
      <PropertyScreen />
      <StatusBar style="auto" />
    </>
  );
}
