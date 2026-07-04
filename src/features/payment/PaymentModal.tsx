import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { usePaymentController } from './PaymentController';
import SignaturePad from '../../components/SignaturePad';

interface PaymentModalProps {
  isVisible: boolean;
  onClose: () => void;
  invoiceId: string;
  totalDue: number;
  billingPeriod: string;
  tenantPhone: string;
}

export default function PaymentModal({
  isVisible,
  onClose,
  invoiceId,
  totalDue,
  billingPeriod,
  tenantPhone,
}: PaymentModalProps) {
  const {
    dbReady,
    payments,
    alreadyPaid,
    amountPaid,
    paymentMethod,
    receiptImage,
    otpRequested,
    enteredOtp,
    signature,
    isSubmitting,
    setAmountPaid,
    setPaymentMethod,
    setReceiptImage,
    setEnteredOtp,
    setSignature,
    handlePickReceipt,
    handleRequestOtp,
    handleRecordPayment,
  } = usePaymentController(invoiceId, totalDue, tenantPhone, onClose);

  const remainingBalance = totalDue - alreadyPaid;

  if (!dbReady || !isVisible) return null;

  return (
    <Modal visible={isVisible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalContent}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Record Payment ({billingPeriod})</Text>

            {/* Balances Card */}
            <View style={styles.balancesContainer}>
              <View style={styles.balanceCol}>
                <Text style={styles.balanceLabel}>Total Due</Text>
                <Text style={styles.balanceVal}>Rs. {totalDue.toLocaleString()}</Text>
              </View>
              <View style={styles.balanceCol}>
                <Text style={styles.balanceLabel}>Paid</Text>
                <Text style={[styles.balanceVal, { color: COLORS.accentGreen }]}>
                  Rs. {alreadyPaid.toLocaleString()}
                </Text>
              </View>
              <View style={styles.balanceCol}>
                <Text style={styles.balanceLabel}>Remaining</Text>
                <Text style={[styles.balanceVal, { color: COLORS.accentOrange }]}>
                  Rs. {remainingBalance.toLocaleString()}
                </Text>
              </View>
            </View>

            <Text style={styles.label}>Amount Paid (Rs.) *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 10000"
              keyboardType="numeric"
              value={amountPaid}
              onChangeText={setAmountPaid}
              editable={!otpRequested} // Lock inputs once OTP is requested
            />

            <Text style={styles.label}>Payment Method</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  paymentMethod === 'cash' && styles.toggleBtnActive,
                ]}
                onPress={() => !otpRequested && setPaymentMethod('cash')}
                disabled={otpRequested}
              >
                <Text
                  style={[
                    styles.toggleText,
                    paymentMethod === 'cash' && styles.toggleTextActive,
                  ]}
                >
                  Cash
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  paymentMethod === 'esewa' && styles.toggleBtnActive,
                ]}
                onPress={() => !otpRequested && setPaymentMethod('esewa')}
                disabled={otpRequested}
              >
                <Text
                  style={[
                    styles.toggleText,
                    paymentMethod === 'esewa' && styles.toggleTextActive,
                  ]}
                >
                  eSewa
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleBtn,
                  paymentMethod === 'khalti' && styles.toggleBtnActive,
                ]}
                onPress={() => !otpRequested && setPaymentMethod('khalti')}
                disabled={otpRequested}
              >
                <Text
                  style={[
                    styles.toggleText,
                    paymentMethod === 'khalti' && styles.toggleTextActive,
                  ]}
                >
                  Khalti
                </Text>
              </TouchableOpacity>
            </View>

            {/* Cash Verification Flow */}
            {paymentMethod === 'cash' && (
              <View style={styles.verificationSection}>
                {!otpRequested ? (
                  <>
                    <SignaturePad onSaveSignature={setSignature} />
                    <TouchableOpacity
                      style={[
                        styles.primaryActionBtn,
                        (!signature || !amountPaid) && styles.actionBtnDisabled,
                      ]}
                      onPress={handleRequestOtp}
                      disabled={!signature || !amountPaid}
                    >
                      <Text style={styles.primaryActionBtnText}>Request OTP & Sign</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <View style={styles.otpCard}>
                    <Text style={styles.otpLabel}>
                      Verify Cash Payment: An SMS OTP was sent to **{tenantPhone}**.
                    </Text>
                    
                    <Text style={styles.label}>Enter 4-Digit OTP *</Text>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      placeholder="e.g. 1234"
                      keyboardType="numeric"
                      maxLength={4}
                      value={enteredOtp}
                      onChangeText={setEnteredOtp}
                    />

                    <TouchableOpacity
                      style={styles.resendBtn}
                      onPress={handleRequestOtp}
                    >
                      <Text style={styles.resendText}>Resend OTP Code</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}

            {/* Digital Upload Flow */}
            {paymentMethod !== 'cash' && (
              <View style={styles.digitalSection}>
                {receiptImage ? (
                  <View style={styles.previewContainer}>
                    <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
                    <TouchableOpacity
                      onPress={() => setReceiptImage(null)}
                      style={styles.removeBtn}
                    >
                      <Text style={styles.removeText}>Remove Image</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={handlePickReceipt}
                  >
                    <Text style={styles.uploadBtnText}>🖼️ Upload Transfer Screenshot</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={onClose}
                disabled={isSubmitting}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              
              {/* Record Payment Button */}
              {((paymentMethod !== 'cash') || (paymentMethod === 'cash' && otpRequested)) && (
                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.modalBtnSave,
                    paymentMethod === 'cash' && !enteredOtp && styles.actionBtnDisabled,
                  ]}
                  onPress={handleRecordPayment}
                  disabled={isSubmitting || (paymentMethod === 'cash' && !enteredOtp)}
                >
                  <Text style={styles.modalBtnSaveText}>
                    {isSubmitting
                      ? 'Saving...'
                      : paymentMethod === 'cash'
                      ? 'Verify & Confirm'
                      : 'Record Payment'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  balancesContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  balanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  balanceVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  verificationSection: {
    marginTop: 8,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.accentOrange,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  primaryActionBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionBtnDisabled: {
    opacity: 0.5,
  },
  otpCard: {
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
    marginTop: 10,
  },
  otpLabel: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 12,
  },
  otpInput: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 8,
  },
  resendBtn: {
    alignSelf: 'center',
    padding: 6,
  },
  resendText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  digitalSection: {
    marginVertical: 10,
  },
  uploadBtn: {
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
  },
  previewContainer: {
    alignItems: 'center',
  },
  receiptPreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: COLORS.white,
  },
  removeBtn: {
    marginTop: 6,
    padding: 6,
  },
  removeText: {
    color: COLORS.red,
    fontWeight: '600',
    fontSize: 13,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingBottom: 20,
  },
  modalBtn: {
    flex: 1,
    height: 44,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  modalBtnCancelText: {
    color: COLORS.textPrimary,
    fontSize: 13,
    fontWeight: '600',
  },
  modalBtnSave: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  modalBtnSaveText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
