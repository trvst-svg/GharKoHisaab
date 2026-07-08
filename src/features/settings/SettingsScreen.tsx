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
  Alert,
} from 'react-native';
import { useSettingsController } from './SettingsController';
import { useTheme } from '../../context/ThemeContext';
import { t } from '../../constants/translations';
import { ThemeName, ThemeColorsType } from '../../constants/colors';

export default function SettingsScreen() {
  const { colors, themeName, language, changeTheme, changeLanguage } = useTheme();
  
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

    // Khalti integration states
    isKhaltiLinked,
    isKhaltiModalVisible,
    khaltiPhone,
    khaltiPublicKey,
    khaltiError,
    setKhaltiError,
    tempKhaltiPhone,
    tempKhaltiKey,
    setIsKhaltiModalVisible,
    setTempKhaltiPhone,
    setTempKhaltiKey,
    handleOpenKhaltiModal,
    handleSaveKhalti,
    handleUnlinkKhalti,
  } = useSettingsController();

  const styles = getStyles(colors);

  if (!dbReady) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  // Simulate payment checkout trigger
  const handleTestKhaltiCheckout = () => {
    if (!isKhaltiLinked) {
      Alert.alert(
        language === 'en' ? 'Setup Required' : 'सेटअप आवश्यक',
        language === 'en' 
          ? 'Please link your Khalti account first.' 
          : 'कृपया पहिले आफ्नो खल्ती खाता लिङ्क गर्नुहोस्।'
      );
      return;
    }
    Alert.alert(
      language === 'en' ? 'Simulating Khalti Payment' : 'खल्ती भुक्तानी अनुकरण',
      language === 'en'
        ? `Launching checkout link matching Khalti merchant: ${khaltiPhone}...\n\nStatus: Merchant Integration is fully active!`
        : `खल्ती मर्चेन्ट नम्बर: ${khaltiPhone} मिलान भएको भुक्तानी सुरु हुँदैछ...\n\nस्थिति: मर्चेन्ट एकीकरण पूर्ण रूपमा सक्रिय छ!`
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>{t('personalization', language)}</Text>
        <Text style={styles.headerTitle}>{t('appSettings', language)}</Text>
      </View>

      {/* Language Section Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('languageHeader', language)}</Text>
        <Text style={styles.cardSubtitle}>{t('languageSubtitle', language)}</Text>

        <View style={styles.languageContainer}>
          <TouchableOpacity
            style={[styles.langBtn, language === 'en' && styles.langBtnActive]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[styles.langBtnText, language === 'en' && styles.langBtnTextActive]}>
              🇺🇸 {t('englishLabel', language)}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, language === 'ne' && styles.langBtnActive]}
            onPress={() => changeLanguage('ne')}
          >
            <Text style={[styles.langBtnText, language === 'ne' && styles.langBtnTextActive]}>
              🇳🇵 {t('nepaliLabel', language)}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Section Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('themeHeader', language)}</Text>
        <Text style={styles.cardSubtitle}>{t('themeSubtitle', language)}</Text>

        <View style={styles.themesContainer}>
          {/* Indigo Swatch */}
          <TouchableOpacity
            style={[styles.themeSwatch, themeName === 'indigo' && styles.themeSwatchActive, { backgroundColor: '#4F46E5' }]}
            onPress={() => changeTheme('indigo')}
          >
            {themeName === 'indigo' && <Text style={styles.swatchCheck}>✓</Text>}
          </TouchableOpacity>

          {/* Dark Swatch */}
          <TouchableOpacity
            style={[styles.themeSwatch, themeName === 'dark' && styles.themeSwatchActive, { backgroundColor: '#1E293B' }]}
            onPress={() => changeTheme('dark')}
          >
            {themeName === 'dark' && <Text style={styles.swatchCheck}>✓</Text>}
          </TouchableOpacity>

          {/* Emerald Swatch */}
          <TouchableOpacity
            style={[styles.themeSwatch, themeName === 'emerald' && styles.themeSwatchActive, { backgroundColor: '#059669' }]}
            onPress={() => changeTheme('emerald')}
          >
            {themeName === 'emerald' && <Text style={styles.swatchCheck}>✓</Text>}
          </TouchableOpacity>
        </View>
        <Text style={styles.themeNameLabel}>
          {themeName === 'indigo' ? t('themeIndigo', language) : themeName === 'dark' ? t('themeDark', language) : t('themeEmerald', language)}
        </Text>
      </View>

      {/* Security Section Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('securityHeader', language)}</Text>
        <Text style={styles.cardSubtitle}>{t('securitySubtitle', language)}</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfoCol}>
            <Text style={styles.settingLabel}>{t('enableLock', language)}</Text>
            <Text style={styles.settingSubLabel}>{t('enableLockSub', language)}</Text>
          </View>
          <Switch
            value={isAppLockEnabled}
            onValueChange={handleToggleLock}
            trackColor={{ false: '#CBD5E1', true: colors.primaryDark }}
            thumbColor={isAppLockEnabled ? colors.primary : '#F1F5F9'}
          />
        </View>

        {isAppLockEnabled && (
          <TouchableOpacity
            style={[styles.changePinBtn, { borderColor: colors.primary }]}
            onPress={() => handleToggleLock(true)}
          >
            <Text style={[styles.changePinText, { color: colors.primary }]}>{t('changePin', language)}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Khalti Integration Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{t('khaltiHeader', language)}</Text>
        <Text style={styles.cardSubtitle}>{t('khaltiSubtitle', language)}</Text>

        <View style={styles.khaltiStatusContainer}>
          <Text style={styles.khaltiStatusText}>{t('khaltiStatus', language)}</Text>
          <Text
            style={[
              styles.khaltiBadge,
              { backgroundColor: isKhaltiLinked ? '#ECFDF5' : '#FEF3C7', color: isKhaltiLinked ? '#059669' : '#D97706' },
            ]}
          >
            {isKhaltiLinked 
              ? `✅ ${t('khaltiLinked', language)} ${khaltiPhone}` 
              : `⚠️ ${t('khaltiNotLinked', language)}`}
          </Text>
        </View>

        <View style={styles.khaltiActions}>
          <TouchableOpacity
            style={[styles.khaltiBtnLink, { backgroundColor: colors.primary }]}
            onPress={handleOpenKhaltiModal}
          >
            <Text style={styles.khaltiBtnLinkText}>{t('btnConfigureKhalti', language)}</Text>
          </TouchableOpacity>

          {isKhaltiLinked && (
            <TouchableOpacity
              style={styles.khaltiBtnUnlink}
              onPress={handleUnlinkKhalti}
            >
              <Text style={styles.khaltiBtnUnlinkText}>Unlink</Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.testCheckoutBtn, { borderColor: colors.primary }]}
          onPress={handleTestKhaltiCheckout}
        >
          <Text style={[styles.testCheckoutText, { color: colors.primary }]}>{t('btnTestCheckout', language)}</Text>
        </TouchableOpacity>
      </View>

      {/* Biometrics Diagnostic Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>📱 Device Biometrics Status</Text>

        <View style={styles.diagnosticRow}>
          <Text style={styles.diagLabel}>Hardware Capability:</Text>
          <Text style={[styles.diagValue, { color: hasBiometricsHardware ? '#10B981' : '#EF4444' }]}>
            {hasBiometricsHardware ? '✅ Supported' : '❌ Unsupported'}
          </Text>
        </View>

        <View style={styles.diagnosticRow}>
          <Text style={styles.diagLabel}>Biometrics Enrolled:</Text>
          <Text style={[styles.diagValue, { color: isBiometricsEnrolled ? '#10B981' : '#F59E0B' }]}>
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
          <Text style={styles.diagValueText}>v1.2.0-secure-khalti</Text>
        </View>
      </View>

      {/* Modal to configure fallback PIN */}
      <Modal visible={isPinModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>{t('modalTitlePin', language)}</Text>
            <Text style={styles.modalSubtitle}>{t('modalSubPin', language)}</Text>

            {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}

            <Text style={styles.inputLabel}>{t('enterPin', language)}</Text>
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

            <Text style={styles.inputLabel}>{t('confirmPin', language)}</Text>
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
                <Text style={styles.cancelBtnText}>{t('btnCancel', language)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSavePin}
              >
                <Text style={styles.saveBtnText}>{t('btnSavePin', language)}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Modal to configure Khalti settings */}
      <Modal visible={isKhaltiModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>{t('modalTitleKhalti', language)}</Text>
            <Text style={styles.modalSubtitle}>{t('modalSubKhalti', language)}</Text>

            {khaltiError ? <Text style={styles.errorText}>{khaltiError}</Text> : null}

            <Text style={styles.inputLabel}>{t('khaltiIdLabel', language)}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 9841223344"
              value={tempKhaltiPhone}
              onChangeText={(text) => {
                setKhaltiError('');
                setTempKhaltiPhone(text.replace(/[^0-9]/g, '').slice(0, 10));
              }}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>{t('khaltiKeyLabel', language)}</Text>
            <TextInput
              style={styles.input}
              placeholder="live_public_key_..."
              value={tempKhaltiKey}
              onChangeText={(text) => {
                setKhaltiError('');
                setTempKhaltiKey(text);
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsKhaltiModalVisible(false)}
              >
                <Text style={styles.cancelBtnText}>{t('btnCancel', language)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={handleSavePin} // Re-routing logic or call handleSaveKhalti
                onPressOut={handleSaveKhalti}
              >
                <Text style={styles.saveBtnText}>{t('btnLinkKhalti', language)}</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Generate dynamic theme stylesheet
const getStyles = (colors: ThemeColorsType) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      padding: 16,
      paddingBottom: 40,
    },
    centerContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    header: {
      marginBottom: 20,
      marginTop: Platform.OS === 'ios' ? 10 : 20,
    },
    headerSubtitle: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 4,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: colors.textPrimary,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: 6,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 20,
      lineHeight: 18,
    },
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    settingInfoCol: {
      flex: 1,
      paddingRight: 16,
    },
    settingLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    settingSubLabel: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    changePinBtn: {
      marginTop: 12,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 8,
    },
    changePinText: {
      fontSize: 14,
      fontWeight: '600',
    },
    languageContainer: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      overflow: 'hidden',
    },
    langBtn: {
      flex: 1,
      paddingVertical: 12,
      alignItems: 'center',
      backgroundColor: colors.cardBackground,
    },
    langBtnActive: {
      backgroundColor: colors.primary,
    },
    langBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    langBtnTextActive: {
      color: colors.white,
    },
    themesContainer: {
      flexDirection: 'row',
      marginBottom: 10,
    },
    themeSwatch: {
      width: 44,
      height: 44,
      borderRadius: 22,
      marginRight: 16,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    themeSwatchActive: {
      borderColor: colors.textPrimary,
    },
    swatchCheck: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: 'bold',
    },
    themeNameLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.textPrimary,
      marginTop: 4,
    },
    khaltiStatusContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    khaltiStatusText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    khaltiBadge: {
      fontSize: 13,
      fontWeight: '700',
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
      overflow: 'hidden',
    },
    khaltiActions: {
      flexDirection: 'row',
      marginBottom: 12,
    },
    khaltiBtnLink: {
      flex: 2,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: 'center',
      marginRight: 8,
    },
    khaltiBtnLinkText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
    khaltiBtnUnlink: {
      flex: 1,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.red,
      borderRadius: 8,
      alignItems: 'center',
    },
    khaltiBtnUnlinkText: {
      color: colors.red,
      fontSize: 14,
      fontWeight: '600',
    },
    testCheckoutBtn: {
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderRadius: 8,
      borderStyle: 'dashed',
    },
    testCheckoutText: {
      fontSize: 14,
      fontWeight: '600',
    },
    diagnosticRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    diagLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    diagValue: {
      fontSize: 14,
      fontWeight: '700',
    },
    diagValueText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.textPrimary,
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
      backgroundColor: colors.cardBackground,
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
      color: colors.textPrimary,
      marginBottom: 8,
    },
    modalSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      lineHeight: 18,
      marginBottom: 16,
    },
    errorText: {
      color: colors.red,
      fontSize: 13,
      fontWeight: '600',
      marginBottom: 12,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
      textTransform: 'uppercase',
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      padding: 10,
      fontSize: 16,
      marginBottom: 16,
      backgroundColor: colors.background,
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
      borderColor: colors.border,
      borderRadius: 8,
      alignItems: 'center',
    },
    cancelBtnText: {
      color: colors.textSecondary,
      fontSize: 14,
      fontWeight: '600',
    },
    saveBtn: {
      flex: 1,
      paddingVertical: 12,
      marginLeft: 8,
      borderRadius: 8,
      alignItems: 'center',
    },
    saveBtnText: {
      color: colors.white,
      fontSize: 14,
      fontWeight: '600',
    },
  });
