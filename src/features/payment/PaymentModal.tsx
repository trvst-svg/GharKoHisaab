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
  Share,
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

  const handleSharePaymentRequest = async () => {
    try {
      const amt = parseFloat(amountPaid) || remainingBalance;
      const message = `GharKoHisaab Payment Request
----------------------------------------
Billing Period: ${billingPeriod}
Outstanding Amount: Rs. ${amt.toLocaleString()}
Method: ${paymentMethod.toUpperCase()}
----------------------------------------
Please transfer Rs. ${amt.toLocaleString()} for your room rent of period ${billingPeriod}.
After transferring, please send the screenshot to confirm.

Thank you!`;
      await Share.share({
        message,
        title: 'GharKoHisaab Payment Request',
      });
    } catch (error) {
      console.error('Error sharing payment request:', error);
    }
  };

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
                <View style={styles.qrContainer}>
                  <Text style={styles.qrTitle}>Scan to Pay via {paymentMethod.toUpperCase()}</Text>
                  <Image
                    source={{
                      uri: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                        `GharKoHisaab Payment:\nInvoice ID: ${invoiceId}\nBilling Period: ${billingPeriod}\nAmount: Rs. ${parseFloat(amountPaid) || remainingBalance}\nPhone: ${tenantPhone}`
                      )}`
                    }}
                    style={styles.qrImage}
                  />
                  <Text style={styles.qrHelpText}>
                    Show this QR code to the tenant to scan and pay Rs. ${(parseFloat(amountPaid) || remainingBalance).toLocaleString()} directly.
                  </Text>
                  <TouchableOpacity style={styles.shareRequestBtn} onPress={handleSharePaymentRequest}>
                    <Text style={styles.shareRequestBtnText}>📤 Share Payment Details</Text>
                  </TouchableOpacity>
                </View>

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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    ...Platform.select({
      web: {
        maxWidth: 600,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        bottom: 40,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
      }
    })
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  balancesContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  balanceCol: {
    flex: 1,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  balanceVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
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
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 6,
    marginBottom: 16,
  },
  toggleBtn: {
    flex: 1,
    height: 40,
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
    fontWeight: '600',
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  verificationSection: {
    marginTop: 8,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.primary,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
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
    backgroundColor: '#F5F3FF', // light tint
    borderWidth: 1,
    borderColor: '#C7D2FE',
    borderRadius: 12,
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
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    height: 40,
    backgroundColor: COLORS.white,
  },
  resendBtn: {
    alignSelf: 'center',
    padding: 6,
  },
  resendText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 12,
  },
  digitalSection: {
    marginVertical: 10,
  },
  uploadBtn: {
    height: 44,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  qrTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qrImage: {
    width: 160,
    height: 160,
    backgroundColor: COLORS.white,
    marginBottom: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  qrHelpText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 12,
  },
  shareRequestBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  shareRequestBtnText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadBtnText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  previewContainer: {
    alignItems: 'center',
  },
  receiptPreview: {
    width: '100%',
    height: 180,
    borderRadius: 10,
    resizeMode: 'contain',
    backgroundColor: COLORS.white,
  },
  removeBtn: {
    marginTop: 6,
    padding: 6,
  },
  removeText: {
    color: COLORS.red,
    fontWeight: 'bold',
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
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginRight: 8,
  },
  modalBtnCancelText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
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
