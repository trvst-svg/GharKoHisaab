import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Crypto from 'expo-crypto';
import { initConnection } from '../../database/connection';
import {
  initPaymentSchema,
  addPayment,
  getPaymentsForInvoice,
  getTotalPaidForInvoice,
  Payment,
} from './PaymentModel';

export function usePaymentController(
  invoiceId: string,
  totalDue: number,
  tenantPhone: string,
  onSuccess: () => void
) {
  const [dbReady, setDbReady] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [alreadyPaid, setAlreadyPaid] = useState(0);

  // Form States
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'esewa' | 'khalti' | 'bank_transfer'>('cash');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);

  // Cash OTP Verification States
  const [otpRequested, setOtpRequested] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [signature, setSignature] = useState<string | null>(null); // SVG path coordinates string

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initConnection();
        await initPaymentSchema();
        setDbReady(true);
        await refreshPayments();
      } catch (error) {
        console.error('Payment feature initialization failed:', error);
      }
    }
    setup();
  }, [invoiceId]);

  const refreshPayments = async () => {
    try {
      const list = await getPaymentsForInvoice(invoiceId);
      setPayments(list);
      
      const paidSum = await getTotalPaidForInvoice(invoiceId);
      setAlreadyPaid(paidSum);
      
      // Auto-set payment amount to remaining due
      const remaining = totalDue - paidSum;
      setAmountPaid(remaining > 0 ? remaining.toString() : '0');
    } catch (error) {
      console.error('Failed to load payments:', error);
    }
  };

  // Launch photo library to pick digital transfer receipt screenshot
  const handlePickReceipt = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Error', 'Gallery access is required.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setReceiptImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick receipt:', error);
    }
  };

  // Request SMS OTP code simulation
  const handleRequestOtp = () => {
    if (!amountPaid.trim() || parseFloat(amountPaid) <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid payment amount.');
      return;
    }

    // Generate secure 4-digit OTP using expo-crypto
    const randomBytes = Crypto.getRandomBytes(2);
    const randomNum = (randomBytes[0] << 8) | randomBytes[1];
    // Modulo 9000 ensures range 0-8999, +1000 ensures range 1000-9999
    const otp = (1000 + (Math.abs(randomNum) % 9000)).toString();
    setGeneratedOtp(otp);
    setOtpRequested(true);

    // Simulate SMS delivery warning
    Alert.alert(
      'Simulated SMS Gateway 💬',
      `Sent OTP code [${otp}] to tenant's mobile number: ${tenantPhone}. \n\n(In production, this connects to an SMS API like Aakash SMS).`,
      [{ text: 'OK' }]
    );
  };

  // Record payment
  const handleRecordPayment = async () => {
    const payVal = parseFloat(amountPaid);
    if (isNaN(payVal) || payVal <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid amount.');
      return;
    }

    if (paymentMethod === 'cash') {
      // 1. Verify signature drawn
      if (!signature) {
        Alert.alert('Validation Error', 'Please ask the tenant to sign on the signature pad.');
        return;
      }

      // 2. Verify OTP code matches
      if (!otpRequested || enteredOtp !== generatedOtp) {
        Alert.alert('Verification Error', 'Invalid or missing OTP code. Please enter the correct code.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const paymentId = Crypto.randomUUID();
      const newPayment: Payment = {
        id: paymentId,
        invoice_id: invoiceId,
        amount_paid: payVal,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString(),
        receipt_image_url: paymentMethod === 'cash' ? null : receiptImage,
        is_confirmed: 1, // Cash is verified by OTP, digital is self-recorded immediately
        otp_code: paymentMethod === 'cash' ? generatedOtp : null,
        signature_data: paymentMethod === 'cash' ? signature : null,
        created_at: new Date().toISOString(),
      };

      await addPayment(newPayment);
      Alert.alert('Success', 'Payment recorded successfully.');
      
      // Reset form states
      setReceiptImage(null);
      setOtpRequested(false);
      setGeneratedOtp(null);
      setEnteredOtp('');
      setSignature(null);

      // Refresh data
      await refreshPayments();
      onSuccess();
    } catch (error) {
      console.error('Recording payment failed:', error);
      Alert.alert('Error', 'Failed to record payment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
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
    refreshPayments,
  };
}
