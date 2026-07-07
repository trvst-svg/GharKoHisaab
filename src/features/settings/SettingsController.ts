import { useState, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import { initSettingsSchema, getSetting, setSetting } from './SettingsModel';

export function useSettingsController() {
  const [dbReady, setDbReady] = useState(false);
  const [isAppLockEnabled, setIsAppLockEnabled] = useState(false);
  const [hasBiometricsHardware, setHasBiometricsHardware] = useState(false);
  const [isBiometricsEnrolled, setIsBiometricsEnrolled] = useState(false);
  const [biometricTypes, setBiometricTypes] = useState<string[]>([]);
  
  // PIN setup workflow states
  const [isPinModalVisible, setIsPinModalVisible] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    async function loadSettings() {
      try {
        // Initialize schema
        await initSettingsSchema();

        // Load lock state
        const enabledStr = await getSetting('app_lock_enabled', 'false');
        setIsAppLockEnabled(enabledStr === 'true');

        // Check biometrics capabilities
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        setHasBiometricsHardware(hasHardware);

        if (hasHardware) {
          const isEnrolled = await LocalAuthentication.isEnrolledAsync();
          setIsBiometricsEnrolled(isEnrolled);

          const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
          const typesList: string[] = [];
          types.forEach(t => {
            if (t === LocalAuthentication.AuthenticationType.FINGERPRINT) {
              typesList.push('Fingerprint');
            } else if (t === LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION) {
              typesList.push('Facial Recognition');
            } else if (t === LocalAuthentication.AuthenticationType.IRIS) {
              typesList.push('Iris Recognition');
            }
          });
          setBiometricTypes(typesList);
        }

        setDbReady(true);
      } catch (error) {
        console.error('Settings initialization failed:', error);
      }
    }
    loadSettings();
  }, []);

  // Set standard app lock toggle value
  const handleToggleLock = async (enabled: boolean) => {
    if (enabled) {
      // Prompt user to configure a new PIN
      setPinCode('');
      setPinConfirm('');
      setPinError('');
      setIsPinModalVisible(true);
    } else {
      // Disabling app lock requires authentication first
      const success = await authenticateUser();
      if (success) {
        await setSetting('app_lock_enabled', 'false');
        await setSetting('app_lock_pin', '');
        setIsAppLockEnabled(false);
      }
    }
  };

  // Perform local authentication query
  const authenticateUser = async (): Promise<boolean> => {
    try {
      // 1. Try biometrics if available and enrolled
      if (hasBiometricsHardware && isBiometricsEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Unlock GharKoHisaab',
          fallbackLabel: 'Use Fallback PIN',
          disableDeviceFallback: false, // Allows OS to fall back to screen password/pattern
        });
        if (result.success) return true;
      }
      
      // 2. Otherwise we fall back to our custom PIN code (must be verified by UI overlay)
      return false;
    } catch (e) {
      console.error('Biometric authentication failed:', e);
      return false;
    }
  };

  // Save the configured PIN and activate App Lock
  const handleSavePin = async () => {
    if (pinCode.length !== 4 || isNaN(parseInt(pinCode))) {
      setPinError('Passcode must be a 4-digit number.');
      return;
    }
    if (pinCode !== pinConfirm) {
      setPinError('Passcodes do not match.');
      return;
    }

    try {
      await setSetting('app_lock_pin', pinCode);
      await setSetting('app_lock_enabled', 'true');
      setIsAppLockEnabled(true);
      setIsPinModalVisible(false);
    } catch (error) {
      setPinError('Failed to save settings.');
      console.error(error);
    }
  };

  return {
    dbReady,
    isAppLockEnabled,
    hasBiometricsHardware,
    isBiometricsEnrolled,
    biometricTypes,
    isPinModalVisible,
    pinCode,
    pinConfirm,
    pinError,
    setIsPinModalVisible,
    setPinCode,
    setPinConfirm,
    setPinError,
    handleToggleLock,
    handleSavePin,
    authenticateUser,
  };
}
