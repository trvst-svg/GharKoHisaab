import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  AppState,
  AppStateStatus,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { getSetting } from '../features/settings/SettingsModel';
import { COLORS } from '../constants/colors';

interface AppLockOverlayProps {
  children: React.ReactNode;
}

export default function AppLockOverlay({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const [enteredPin, setEnteredPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isBiometricsAvailable, setIsBiometricsAvailable] = useState(false);
  
  const appState = useRef(AppState.currentState);
  const correctPinRef = useRef<string | null>(null);

  // Load configuration settings
  const checkLockState = async () => {
    const enabledStr = await getSetting('app_lock_enabled', 'false');
    const savedPin = await getSetting('app_lock_pin', '');
    correctPinRef.current = savedPin;

    if (enabledStr === 'true' && savedPin) {
      setIsLocked(true);
      
      // Check biometrics eligibility
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const eligible = hasHardware && isEnrolled;
      setIsBiometricsAvailable(eligible);

      if (eligible) {
        triggerBiometrics();
      }
    } else {
      setIsLocked(false);
    }
  };

  useEffect(() => {
    // Run initial check
    checkLockState();

    // Setup AppState listeners to trigger locks on resume
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, []);

  const handleAppStateChange = async (nextAppState: AppStateStatus) => {
    if (
      appState.current.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // Re-trigger the lock state verification
      await checkLockState();
    }
    appState.current = nextAppState;
  };

  // Launch biometric prompt
  const triggerBiometrics = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock GharKoHisaab',
        fallbackLabel: 'Use Passcode PIN',
        disableDeviceFallback: false,
      });

      if (result.success) {
        setIsLocked(false);
        setEnteredPin('');
        setPinError(false);
      }
    } catch (e) {
      console.error('Biometric verification failed:', e);
    }
  };

  // Handle dial pad buttons tap
  const handlePressKey = (num: string) => {
    setPinError(false);
    if (enteredPin.length < 4) {
      const newPin = enteredPin + num;
      setEnteredPin(newPin);

      if (newPin.length === 4) {
        if (newPin === correctPinRef.current) {
          setIsLocked(false);
          setEnteredPin('');
        } else {
          setPinError(true);
          // Auto clear wrong PIN after 600ms
          setTimeout(() => {
            setEnteredPin('');
          }, 600);
        }
      }
    }
  };

  const handleClear = () => {
    if (enteredPin.length > 0) {
      setEnteredPin(enteredPin.slice(0, -1));
    }
  };

  if (!isLocked) {
    return <>{children}</>;
  }

  // Renders a sleek passcode pad view
  return (
    <SafeAreaView style={styles.overlayContainer}>
      <View style={styles.content}>
        <Text style={styles.logo}>GharKoHisaab 🏡</Text>
        <Text style={styles.title}>Application Locked</Text>
        <Text style={styles.subtitle}>Enter 4-digit passcode or verify biometrics</Text>

        {/* PIN Indicators progress dots */}
        <View style={styles.indicatorContainer}>
          {[0, 1, 2, 3].map((idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                enteredPin.length > idx && styles.dotFilled,
                pinError && styles.dotError,
              ]}
            />
          ))}
        </View>

        {pinError && <Text style={styles.errorText}>Incorrect Passcode. Try again.</Text>}

        {/* Keyboard Pad Grid */}
        <View style={styles.keyboard}>
          {[
            ['1', '2', '3'],
            ['4', '5', '6'],
            ['7', '8', '9'],
          ].map((row, rowIdx) => (
            <View key={rowIdx} style={styles.row}>
              {row.map((num) => (
                <TouchableOpacity
                  key={num}
                  style={styles.keyBtn}
                  onPress={() => handlePressKey(num)}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          {/* Bottom Control Row */}
          <View style={styles.row}>
            {/* Biometric trigger button */}
            <TouchableOpacity
              style={[styles.keyBtn, !isBiometricsAvailable && styles.keyBtnHidden]}
              disabled={!isBiometricsAvailable}
              onPress={triggerBiometrics}
            >
              <Text style={styles.controlText}>🔍</Text>
            </TouchableOpacity>

            {/* Zero digit */}
            <TouchableOpacity style={styles.keyBtn} onPress={() => handlePressKey('0')}>
              <Text style={styles.keyText}>0</Text>
            </TouchableOpacity>

            {/* Backspace clear button */}
            <TouchableOpacity style={styles.keyBtn} onPress={handleClear}>
              <Text style={styles.controlText}>⌫</Text>
            </TouchableOpacity>
          </View>
        </View>

        {isBiometricsAvailable && (
          <TouchableOpacity style={styles.bioPromptBtn} onPress={triggerBiometrics}>
            <Text style={styles.bioPromptText}>Touch/Face Unlock</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 40,
    textAlign: 'center',
  },
  indicatorContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    height: 16,
    alignItems: 'center',
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginHorizontal: 12,
    backgroundColor: 'transparent',
  },
  dotFilled: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dotError: {
    backgroundColor: COLORS.red,
    borderColor: COLORS.red,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 14,
    marginBottom: 20,
    fontWeight: '500',
  },
  keyboard: {
    width: 280,
    marginBottom: 30,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  keyBtn: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  keyBtnHidden: {
    opacity: 0,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  keyText: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  controlText: {
    fontSize: 20,
    color: COLORS.textSecondary,
  },
  bioPromptBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  bioPromptText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '600',
  },
});
