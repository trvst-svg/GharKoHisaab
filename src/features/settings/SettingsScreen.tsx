import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Switch,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useSettingsController } from './SettingsController';
import { COLORS } from '../../constants/colors';

export default function SettingsScreen() {
  const {
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
  } = useSettingsController();

  if (!dbReady) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Personalization</Text>
        <Text style={styles.headerTitle}>App Settings</Text>
      </View>

      {/* Security Section Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔐 App Lock & Security</Text>
        <Text style={styles.cardSubtitle}>
          Secure your ledger records. Re-authenticates on launch and resuming from background.
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfoCol}>
            <Text style={styles.settingLabel}>Enable Application Lock</Text>
            <Text style={styles.settingSubLabel}>Requires biometric scan or 4-digit PIN</Text>
          </View>
          <Switch
            value={isAppLockEnabled}
            onValueChange={handleToggleLock}
            trackColor={{ false: '#CBD5E1', true: '#C7D2FE' }}
            thumbColor={isAppLockEnabled ? COLORS.primary : '#F1F5F9'}
          />
        </View>

        {isAppLockEnabled && (
          <TouchableOpacity
            style={styles.changePinBtn}
            onPress={() => handleToggleLock(true)}
          >
            <Text style={styles.changePinText}>✏️ Change Passcode PIN</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Biometrics Diagnostic Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Device Biometrics Status</Text>

        <View style={styles.diagnosticRow}>
          <Text style={styles.diagLabel}>Hardware Capability:</Text>
          <Text style={[styles.diagValue, { color: hasBiometricsHardware ? COLORS.accentGreen : COLORS.red }]}>
            {hasBiometricsHardware ? '✅ Supported' : '❌ Unsupported'}
          </Text>
        </View>

        <View style={styles.diagnosticRow}>
          <Text style={styles.diagLabel}>Biometrics Enrolled:</Text>
          <Text style={[styles.diagValue, { color: isBiometricsEnrolled ? COLORS.accentGreen : COLORS.accentOrange }]}>
            {isBiometricsEnrolled ? '✅ Set Up & Ready' : '⚠️ Not Enrolled'}
          </Text>
        </View>

        {hasBiometricsHardware && biometricTypes.length > 0 && (
          <View style={styles.diagnosticRow}>
            <Text style={styles.diagLabel}>Available Methods:</Text>
            <Text style={styles.diagValueText}>{biometricTypes.join(', ')}</Text>
          </View>
        )}
      </View>

      {/* App Info Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>ℹ️ App Version</Text>
        <View style={styles.diagnosticRow}>
          <Text style={styles.diagLabel}>GharKoHisaab (घरको हिसाब)</Text>
          <Text style={styles.diagValueText}>v1.1.0-secure</Text>
        </View>
      </View>

      {/* Modal to configure custom fallback PIN */}
      <Modal visible={isPinModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Configure App Lock PIN</Text>
            <Text style={styles.modalSubtitle}>
              Configure a 4-digit fallback PIN. This is used if biometrics fail or are unavailable.
            </Text>

            {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

            <Text style={styles.inputLabel}>Enter 4-Digit Passcode</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 1234"
              value={pinCode}
              onChangeText={(text) => {
                setPinError('');
                setPinCode(text.replace(/[^0-9]/g, '').slice(0, 4));
              }}
              keyboardType="number-pad"
              secureTextEntry
            />

            <Text style={styles.inputLabel}>Confirm 4-Digit Passcode</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm passcode"
              value={pinConfirm}
              onChangeText={(text) => {
                setPinError('');
                setPinConfirm(text.replace(/[^0-9]/g, '').slice(0, 4));
              }}
              keyboardType="number-pad"
              secureTextEntry
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsPinModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSavePin}>
                <Text style={styles.saveBtnText}>Save PIN</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    marginBottom: 20,
    marginTop: Platform.OS === 'ios' ? 10 : 20,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 20,
    lineHeight: 18,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  settingInfoCol: {
    flex: 1,
    paddingRight: 16,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  settingSubLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  changePinBtn: {
    marginTop: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
  },
  changePinText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  diagnosticRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  diagLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  diagValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  diagValueText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
});
