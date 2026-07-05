import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAgreementController } from './AgreementController';
import SignaturePad from '../../components/SignaturePad';

interface AgreementModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenancyId: string;
  baseRent: number;
  securityDeposit: number;
  startDateBs: string;
  tenantName: string;
  housekeeperName: string;
  roomNumber: string;
  readOnly?: boolean; // when viewing an existing signed agreement
}

export default function AgreementModal({
  visible,
  onClose,
  onSuccess,
  tenancyId,
  baseRent,
  securityDeposit,
  startDateBs,
  tenantName,
  housekeeperName,
  roomNumber,
  readOnly = false,
}: AgreementModalProps) {
  const {
    dbReady,
    existingAgreement,
    isSaving,
    step,
    goNext,
    goBack,
    electricityRate,
    setElectricityRate,
    waterRate,
    setWaterRate,
    wasteRate,
    setWasteRate,
    specialTerms,
    setSpecialTerms,
    housekeeperSignature,
    setHousekeeperSignature,
    tenantSignature,
    setTenantSignature,
    handleSaveAgreement,
  } = useAgreementController({
    tenancyId,
    baseRent,
    securityDeposit,
    startDateBs,
  });

  if (!visible) return null;

  // If read-only mode and agreement exists, show summary
  const isViewMode = readOnly && existingAgreement;

  const renderStepIndicator = () => (
    <View style={styles.stepIndicator}>
      {[1, 2, 3].map((s) => (
        <View key={s} style={styles.stepRow}>
          <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, step >= s && styles.stepDotTextActive]}>
              {s}
            </Text>
          </View>
          {s < 3 && (
            <View style={[styles.stepLine, step > s && styles.stepLineActive]} />
          )}
        </View>
      ))}
    </View>
  );

  const renderStep1 = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepTitle}>📋 Review Agreement Terms</Text>
      <Text style={styles.stepSubtitle}>
        Rental agreement between {housekeeperName} (Landlord) and {tenantName} (Tenant) for Room {roomNumber}.
      </Text>

      {/* Fixed terms card */}
      <View style={styles.termsCard}>
        <Text style={styles.termsCardTitle}>Contract Summary</Text>

        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Monthly Base Rent</Text>
          <Text style={styles.termValue}>Rs. {baseRent.toLocaleString()}</Text>
        </View>

        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Security Deposit (Dharauti)</Text>
          <Text style={styles.termValue}>Rs. {securityDeposit.toLocaleString()}</Text>
        </View>

        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Tenancy Start Date (B.S.)</Text>
          <Text style={styles.termValue}>{startDateBs}</Text>
        </View>
      </View>

      {/* Editable utility rates */}
      <View style={styles.termsCard}>
        <Text style={styles.termsCardTitle}>Utility Rates</Text>

        <Text style={styles.inputLabel}>Electricity Rate (Rs. per unit)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={electricityRate}
          onChangeText={setElectricityRate}
          editable={!isViewMode}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.inputLabel}>Water Rate (Rs. per month)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={waterRate}
          onChangeText={setWaterRate}
          editable={!isViewMode}
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.inputLabel}>Waste Management (Rs. per month)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={wasteRate}
          onChangeText={setWasteRate}
          editable={!isViewMode}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {/* Special terms */}
      <View style={styles.termsCard}>
        <Text style={styles.termsCardTitle}>Special Terms & Conditions</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          placeholder="e.g., No pets allowed. Quiet hours after 10 PM. Parking space included."
          value={specialTerms}
          onChangeText={setSpecialTerms}
          editable={!isViewMode}
          placeholderTextColor={COLORS.textSecondary}
        />
      </View>

      {!isViewMode && (
        <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
          <Text style={styles.nextBtnText}>Proceed to Housekeeper Signature →</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );

  const renderStep2 = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepTitle}>✍️ Housekeeper Signature</Text>
      <Text style={styles.stepSubtitle}>
        {housekeeperName}, please sign below to confirm you agree to the terms above.
      </Text>

      <View style={styles.agreementBox}>
        <Text style={styles.agreementText}>
          I, <Text style={styles.boldText}>{housekeeperName}</Text>, hereby agree to rent Room {roomNumber} to{' '}
          <Text style={styles.boldText}>{tenantName}</Text> at a monthly rent of{' '}
          <Text style={styles.boldText}>Rs. {baseRent.toLocaleString()}</Text> starting{' '}
          <Text style={styles.boldText}>{startDateBs}</Text> (B.S.).
        </Text>
      </View>

      {isViewMode && existingAgreement?.housekeeper_signature ? (
        <View style={styles.signedBadge}>
          <Text style={styles.signedBadgeText}>✅ Housekeeper Signed</Text>
          <Text style={styles.signedDate}>
            Signed on {existingAgreement.signed_at ? new Date(existingAgreement.signed_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      ) : (
        <SignaturePad onSaveSignature={setHousekeeperSignature} />
      )}

      {housekeeperSignature && !isViewMode && (
        <View style={styles.signedConfirmation}>
          <Text style={styles.signedConfirmationText}>✅ Signature captured</Text>
        </View>
      )}

      {!isViewMode && (
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backStepBtn} onPress={goBack}>
            <Text style={styles.backStepBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.nextBtn} onPress={goNext}>
            <Text style={styles.nextBtnText}>Proceed to Tenant Signature →</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderStep3 = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepTitle}>✍️ Tenant Signature</Text>
      <Text style={styles.stepSubtitle}>
        {tenantName}, please sign below to confirm you agree to the rental terms.
      </Text>

      <View style={styles.agreementBox}>
        <Text style={styles.agreementText}>
          I, <Text style={styles.boldText}>{tenantName}</Text>, agree to rent Room {roomNumber} from{' '}
          <Text style={styles.boldText}>{housekeeperName}</Text> at a monthly rent of{' '}
          <Text style={styles.boldText}>Rs. {baseRent.toLocaleString()}</Text>, with a security deposit of{' '}
          <Text style={styles.boldText}>Rs. {securityDeposit.toLocaleString()}</Text>, starting{' '}
          <Text style={styles.boldText}>{startDateBs}</Text> (B.S.).
        </Text>
      </View>

      {isViewMode && existingAgreement?.tenant_signature ? (
        <View style={styles.signedBadge}>
          <Text style={styles.signedBadgeText}>✅ Tenant Signed</Text>
          <Text style={styles.signedDate}>
            Signed on {existingAgreement.signed_at ? new Date(existingAgreement.signed_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      ) : (
        <SignaturePad onSaveSignature={setTenantSignature} />
      )}

      {tenantSignature && !isViewMode && (
        <View style={styles.signedConfirmation}>
          <Text style={styles.signedConfirmationText}>✅ Signature captured</Text>
        </View>
      )}

      {!isViewMode && (
        <View style={styles.navRow}>
          <TouchableOpacity style={styles.backStepBtn} onPress={goBack}>
            <Text style={styles.backStepBtnText}>← Back</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.signBtn, isSaving && styles.signBtnDisabled]}
            onPress={async () => {
              await handleSaveAgreement();
              onSuccess();
            }}
            disabled={isSaving}
          >
            <Text style={styles.signBtnText}>
              {isSaving ? 'Saving...' : '📝 Sign Agreement'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderViewMode = () => (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <Text style={styles.stepTitle}>📄 Signed Agreement</Text>

      <View style={styles.termsCard}>
        <Text style={styles.termsCardTitle}>Contract Summary</Text>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Landlord</Text>
          <Text style={styles.termValue}>{housekeeperName}</Text>
        </View>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Tenant</Text>
          <Text style={styles.termValue}>{tenantName}</Text>
        </View>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Room</Text>
          <Text style={styles.termValue}>{roomNumber}</Text>
        </View>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Monthly Rent</Text>
          <Text style={styles.termValue}>Rs. {existingAgreement!.base_rent.toLocaleString()}</Text>
        </View>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Security Deposit</Text>
          <Text style={styles.termValue}>Rs. {existingAgreement!.security_deposit.toLocaleString()}</Text>
        </View>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Start Date (B.S.)</Text>
          <Text style={styles.termValue}>{existingAgreement!.start_date_bs}</Text>
        </View>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Electricity Rate</Text>
          <Text style={styles.termValue}>Rs. {existingAgreement!.electricity_rate}/unit</Text>
        </View>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Water Rate</Text>
          <Text style={styles.termValue}>Rs. {existingAgreement!.water_rate}/mo</Text>
        </View>
        <View style={styles.termRow}>
          <Text style={styles.termLabel}>Waste Management</Text>
          <Text style={styles.termValue}>Rs. {existingAgreement!.waste_rate}/mo</Text>
        </View>
      </View>

      {existingAgreement!.special_terms && (
        <View style={styles.termsCard}>
          <Text style={styles.termsCardTitle}>Special Terms</Text>
          <Text style={styles.specialTermsDisplay}>{existingAgreement!.special_terms}</Text>
        </View>
      )}

      <View style={styles.termsCard}>
        <Text style={styles.termsCardTitle}>Signatures</Text>
        <View style={styles.signedBadge}>
          <Text style={styles.signedBadgeText}>
            {existingAgreement!.housekeeper_signature ? '✅ Housekeeper Signed' : '⏳ Housekeeper Pending'}
          </Text>
        </View>
        <View style={[styles.signedBadge, { marginTop: 8 }]}>
          <Text style={styles.signedBadgeText}>
            {existingAgreement!.tenant_signature ? '✅ Tenant Signed' : '⏳ Tenant Pending'}
          </Text>
        </View>
        {existingAgreement!.signed_at && (
          <Text style={styles.signedDate}>
            Signed: {new Date(existingAgreement!.signed_at).toLocaleString()}
          </Text>
        )}
        {existingAgreement!.device_id && (
          <Text style={styles.deviceIdText}>
            Device: {existingAgreement!.device_id}
          </Text>
        )}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalContainer}
      >
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeBtnText}>✕ Close</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>
            {isViewMode ? 'View Agreement' : 'Tenancy Agreement'}
          </Text>
          <View style={{ width: 70 }} />
        </View>

        {!isViewMode && renderStepIndicator()}

        {!dbReady ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : isViewMode ? (
          renderViewMode()
        ) : step === 1 ? (
          renderStep1()
        ) : step === 2 ? (
          renderStep2()
        ) : (
          renderStep3()
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  closeBtnText: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepDotText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
  },
  stepDotTextActive: {
    color: COLORS.white,
  },
  stepLine: {
    width: 50,
    height: 3,
    backgroundColor: COLORS.border,
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: COLORS.primary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  stepSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  termsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  termsCardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  termRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.04)',
  },
  termLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  termValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 42,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 4,
  },
  textArea: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  agreementBox: {
    backgroundColor: '#FFF8E1',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#F9E79F',
    marginBottom: 16,
  },
  agreementText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  signedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  signedBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
  },
  signedDate: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'center',
  },
  signedConfirmation: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  signedConfirmationText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accentGreen,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 20,
  },
  backStepBtn: {
    height: 46,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backStepBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  nextBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  nextBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  signBtn: {
    flex: 1,
    height: 46,
    borderRadius: 8,
    backgroundColor: COLORS.accentGreen,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  signBtnDisabled: {
    opacity: 0.5,
  },
  signBtnText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  specialTermsDisplay: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 20,
  },
  deviceIdText: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
