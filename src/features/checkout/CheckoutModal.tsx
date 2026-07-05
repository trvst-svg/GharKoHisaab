import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useCheckoutController } from './CheckoutController';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  tenancyId: string;
  roomId: string;
  roomNumber: string;
  baseRent: number;
  startDate: string;
  securityDeposit: number;
}

export default function CheckoutModal({
  visible,
  onClose,
  onSuccess,
  tenancyId,
  roomId,
  roomNumber,
  baseRent,
  startDate,
  securityDeposit,
}: CheckoutModalProps) {
  const {
    dbReady,
    arrears,
    lastReading,
    checkoutYear,
    checkoutMonth,
    checkoutDay,
    finalElectricityReading,
    electricityRate,
    waterFee,
    wasteFee,
    damageFee,
    isSettled,
    isSaving,
    setCheckoutYear,
    setCheckoutMonth,
    setCheckoutDay,
    setFinalElectricityReading,
    setElectricityRate,
    setWaterFee,
    setWasteFee,
    setDamageFee,
    setIsSettled,
    getProRatedDetails,
    getFinalElectricityCost,
    getFinalUtilityDue,
    getNetBalanceAndBreakdown,
    handleConfirmCheckout,
  } = useCheckoutController(tenancyId, roomId, baseRent, startDate, securityDeposit, onSuccess);

  const [step, setStep] = useState(1);

  if (!dbReady || !visible) {
    return null;
  }

  const proDetails = getProRatedDetails();
  const breakdown = getNetBalanceAndBreakdown();
  const isDateError = 'error' in proDetails;
  const isBreakdownError = 'error' in breakdown;

  const elecCost = getFinalElectricityCost();

  const handleNext = () => {
    if (step === 1 && isDateError) {
      alert(proDetails.error);
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Checkout Wizard (Room {roomNumber})</Text>
              <TouchableOpacity onPress={onClose} disabled={isSaving} style={styles.closeBtn}>
                <Text style={styles.closeBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>

            {/* Step Indicators */}
            <View style={styles.stepIndicatorContainer}>
              <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]}>
                <Text style={styles.stepText}>1. Date</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]}>
                <Text style={styles.stepText}>2. Dues</Text>
              </View>
              <View style={styles.stepLine} />
              <View style={[styles.stepDot, step >= 3 && styles.stepDotActive]}>
                <Text style={styles.stepText}>3. Settle</Text>
              </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Step 1: Checkout Date & Pro-Rated Rent */}
              {step === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.sectionTitle}>1. Set Checkout Date (B.S.)</Text>
                  
                  <View style={styles.dateInputsContainer}>
                    <View style={styles.dateField}>
                      <Text style={styles.dateLabel}>Year (YYYY)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="2083"
                        keyboardType="numeric"
                        maxLength={4}
                        value={checkoutYear}
                        onChangeText={setCheckoutYear}
                      />
                    </View>
                    <View style={styles.dateField}>
                      <Text style={styles.dateLabel}>Month (MM)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="03"
                        keyboardType="numeric"
                        maxLength={2}
                        value={checkoutMonth}
                        onChangeText={setCheckoutMonth}
                      />
                    </View>
                    <View style={styles.dateField}>
                      <Text style={styles.dateLabel}>Day (DD)</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="15"
                        keyboardType="numeric"
                        maxLength={2}
                        value={checkoutDay}
                        onChangeText={setCheckoutDay}
                      />
                    </View>
                  </View>

                  {!isDateError ? (
                    <View style={styles.calcResultCard}>
                      <Text style={styles.calcHeader}>Pro-Rated Rent Calculation</Text>
                      <View style={styles.calcRow}>
                        <Text style={styles.calcLabel}>Cycle Boundaries</Text>
                        <Text style={styles.calcValue}>
                          {proDetails.cycleStartBS} to {proDetails.cycleEndBS}
                        </Text>
                      </View>
                      <View style={styles.calcRow}>
                        <Text style={styles.calcLabel}>Days Stayed / Total</Text>
                        <Text style={styles.calcValue}>
                          {proDetails.daysStayed} / {proDetails.totalDays} Days
                        </Text>
                      </View>
                      <View style={styles.calcRow}>
                        <Text style={styles.calcLabel}>Base Rent</Text>
                        <Text style={styles.calcValue}>Rs. {baseRent.toLocaleString()}</Text>
                      </View>
                      <View style={[styles.calcRow, styles.finalRow]}>
                        <Text style={styles.finalLabel}>Pro-Rated Rent Due</Text>
                        <Text style={styles.finalValue}>
                          Rs. {Math.round(proDetails.proRatedRent).toLocaleString()}
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.errorCard}>
                      <Text style={styles.errorText}>⚠️ {proDetails.error}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Step 2: Final Utility & Damages */}
              {step === 2 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.sectionTitle}>2. Record Final Dues & Utilities</Text>

                  {/* Electricity Meter Card */}
                  {lastReading ? (
                    <View style={styles.card}>
                      <Text style={styles.cardHeader}>Electricity Sub-Meter (Units)</Text>
                      
                      <View style={styles.meterInfoRow}>
                        <Text style={styles.meterInfoLabel}>Previous Reading:</Text>
                        <Text style={styles.meterInfoVal}>{lastReading.electricity_reading} units</Text>
                      </View>

                      <Text style={styles.label}>Final Checkout Reading *</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="e.g. 1024"
                        value={finalElectricityReading}
                        onChangeText={setFinalElectricityReading}
                      />

                      <Text style={styles.label}>Rate per Unit (Rs.)</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="numeric"
                        placeholder="12"
                        value={electricityRate}
                        onChangeText={setElectricityRate}
                      />

                      <View style={styles.meterSummaryRow}>
                        <Text style={styles.meterSummaryLabel}>Calculated Electricity Due:</Text>
                        <Text style={styles.meterSummaryVal}>Rs. {elecCost.toLocaleString()}</Text>
                      </View>
                    </View>
                  ) : (
                    <View style={styles.card}>
                      <Text style={styles.cardHeader}>Electricity Due (Flat/Manual)</Text>
                      <Text style={styles.infoText}>No previous readings found. Enter flat utility due below.</Text>
                    </View>
                  )}

                  {/* Manual Fees Card */}
                  <View style={styles.card}>
                    <Text style={styles.cardHeader}>Final Charges</Text>

                    <Text style={styles.label}>Community Water Charge (Rs.)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="0"
                      value={waterFee}
                      onChangeText={setWaterFee}
                    />

                    <Text style={styles.label}>Waste Management Charge (Rs.)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="0"
                      value={wasteFee}
                      onChangeText={setWasteFee}
                    />

                    <Text style={styles.label}>Property Damage Charges (Rs.)</Text>
                    <TextInput
                      style={styles.input}
                      keyboardType="numeric"
                      placeholder="0"
                      value={damageFee}
                      onChangeText={setDamageFee}
                    />
                  </View>

                  {/* Outstanding Arrears Display */}
                  <View style={styles.arrearsBox}>
                    <Text style={styles.arrearsLabel}>Outstanding Ledger Arrears:</Text>
                    <Text style={styles.arrearsVal}>Rs. {arrears.toLocaleString()}</Text>
                  </View>
                </View>
              )}

              {/* Step 3: Final Settlement Summary */}
              {step === 3 && (
                <View style={styles.stepContainer}>
                  <Text style={styles.sectionTitle}>3. Final Settlement Audit</Text>

                  {!isBreakdownError ? (
                    <View style={styles.summaryCard}>
                      <Text style={styles.summaryCardTitle}>Financial Breakdown</Text>
                      
                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Pro-Rated Rent ({breakdown.daysStayed}/{breakdown.totalDays} Days):</Text>
                        <Text style={styles.summaryVal}>+ Rs. {Math.round(breakdown.proRent).toLocaleString()}</Text>
                      </View>

                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Final Utilities (Elec/Water/Waste):</Text>
                        <Text style={styles.summaryVal}>+ Rs. {breakdown.utilDue.toLocaleString()}</Text>
                      </View>

                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Outstanding Arrears:</Text>
                        <Text style={styles.summaryVal}>+ Rs. {arrears.toLocaleString()}</Text>
                      </View>

                      <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Property Damage Charges:</Text>
                        <Text style={styles.summaryVal}>+ Rs. {breakdown.damages.toLocaleString()}</Text>
                      </View>

                      <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalRowLabel}>Gross Dues Accumulation:</Text>
                        <Text style={styles.totalRowVal}>Rs. {Math.round(breakdown.totalDues).toLocaleString()}</Text>
                      </View>

                      <View style={styles.summaryRow}>
                        <Text style={styles.depositLabel}>Security Deposit Held (Dharauti):</Text>
                        <Text style={styles.depositVal}>- Rs. {breakdown.depositHeld.toLocaleString()}</Text>
                      </View>

                      {/* Net Balance Highlight */}
                      <View style={styles.netBalanceContainer}>
                        <Text style={styles.netLabel}>Net Settlement Balance:</Text>
                        {breakdown.netBalance > 0 ? (
                          <View style={[styles.badge, styles.badgeDebit]}>
                            <Text style={styles.badgeLabel}>TENANT OWES LANDLORD</Text>
                            <Text style={styles.badgeVal}>Rs. {Math.round(breakdown.netBalance).toLocaleString()}</Text>
                          </View>
                        ) : breakdown.netBalance < 0 ? (
                          <View style={[styles.badge, styles.badgeCredit]}>
                            <Text style={styles.badgeLabel}>LANDLORD REFUNDS TENANT</Text>
                            <Text style={styles.badgeVal}>Rs. {Math.round(Math.abs(breakdown.netBalance)).toLocaleString()}</Text>
                          </View>
                        ) : (
                          <View style={[styles.badge, styles.badgeBalanced]}>
                            <Text style={styles.badgeLabel}>BALANCED (NO PAYMENT DUE)</Text>
                            <Text style={styles.badgeVal}>Rs. 0</Text>
                          </View>
                        )}
                      </View>

                      {/* Immediate Settlement Toggle */}
                      {breakdown.netBalance !== 0 && (
                        <TouchableOpacity
                          style={styles.checkboxContainer}
                          onPress={() => setIsSettled(!isSettled)}
                        >
                          <View style={[styles.checkbox, isSettled && styles.checkboxChecked]}>
                            {isSettled && <Text style={styles.checkIcon}>✓</Text>}
                          </View>
                          <Text style={styles.checkboxText}>
                            Record transaction as settled now (cash exchanged / deposit refunded)
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : (
                    <View style={styles.errorCard}>
                      <Text style={styles.errorText}>⚠️ {breakdown.error}</Text>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {/* Wizard Navigation Footer */}
            <View style={styles.modalFooter}>
              {step > 1 ? (
                <TouchableOpacity onPress={handleBack} disabled={isSaving} style={styles.backBtnFooter}>
                  <Text style={styles.backTextFooter}>Back</Text>
                </TouchableOpacity>
              ) : (
                <View style={{ flex: 1 }} />
              )}

              {step < 3 ? (
                <TouchableOpacity onPress={handleNext} style={styles.nextBtnFooter}>
                  <Text style={styles.nextTextFooter}>Next</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleConfirmCheckout}
                  disabled={isSaving || isBreakdownError}
                  style={[styles.confirmBtn, isBreakdownError && styles.confirmBtnDisabled]}
                >
                  {isSaving ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.confirmText}>Complete Checkout</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    height: '90%',
    width: '100%',
  },
  modalContent: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
      }
    })
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  closeBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
      }
    })
  },
  stepDot: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 100,
    backgroundColor: COLORS.border,
  },
  stepDotActive: {
    backgroundColor: COLORS.primary,
  },
  stepText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  stepLine: {
    width: 30,
    height: 2,
    backgroundColor: COLORS.border,
    marginHorizontal: 8,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
      }
    })
  },
  stepContainer: {
    width: '100%',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
    marginTop: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  meterInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  meterInfoLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  meterInfoVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  meterSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  meterSummaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  meterSummaryVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  arrearsBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginBottom: 16,
  },
  arrearsLabel: {
    fontSize: 13,
    color: COLORS.red,
    fontWeight: '600',
  },
  arrearsVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.red,
  },
  summaryCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  summaryCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  depositTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.accentGreen,
    marginBottom: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  depositLabel: {
    fontSize: 13,
    color: COLORS.accentGreen,
  },
  depositVal: {
    fontWeight: 'bold',
    color: COLORS.accentGreen,
    fontSize: 13,
  },
  netBalanceContainer: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 16,
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badge: {
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  badgeDebit: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  badgeCredit: {
    backgroundColor: '#DEF7EC',
    borderColor: '#A7F3D0',
  },
  badgeBalanced: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  badgeVal: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 4,
    color: COLORS.textPrimary,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    backgroundColor: COLORS.white,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
  },
  checkIcon: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  checkboxText: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
      }
    })
  },
  backBtnFooter: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backTextFooter: {
    color: COLORS.textSecondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  nextBtnFooter: {
    flex: 1,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  nextTextFooter: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  confirmBtn: {
    flex: 2,
    height: 44,
    backgroundColor: COLORS.accentOrange,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  confirmBtnDisabled: {
    backgroundColor: COLORS.border,
    opacity: 0.5,
  },
  confirmText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  calculationCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  calcHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  calcLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  calcValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  finalRow: {
    borderBottomWidth: 0,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  finalLabel: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  finalValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FEE2E2',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: COLORS.red,
    fontWeight: '500',
  },
});
