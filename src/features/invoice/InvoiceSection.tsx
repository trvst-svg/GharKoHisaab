import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Share,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useInvoiceController } from './InvoiceController';
import PaymentModal from '../payment/PaymentModal';

interface InvoiceSectionProps {
  tenancyId: string;
  baseRent: number;
  startDate: string;
  tenantPhone: string;
}

export default function InvoiceSection({
  tenancyId,
  baseRent,
  startDate,
  tenantPhone,
}: InvoiceSectionProps) {
  const {
    dbReady,
    invoices,
    lastReading,
    arrears,
    isGenerating,
    currElectricity,
    electricityRate,
    waterFee,
    wasteFee,
    currentPeriod,
    setCurrElectricity,
    setElectricityRate,
    setWaterFee,
    setWasteFee,
    isCurrentPeriodPending,
    calculateLiveTotal,
    getElectricityUnits,
    handleGenerateInvoice,
    refreshRecords,
  } = useInvoiceController(tenancyId, baseRent, startDate);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<any | null>(null);

  const handleShareInvoice = async (invoice: any) => {
    try {
      const isPaid = invoice.status === 'paid';
      const title = isPaid ? 'GharKoHisaab Payment Receipt' : 'GharKoHisaab Rental Invoice';
      
      const message = `${title}
----------------------------------------
Period: ${invoice.billing_period}
Status: ${invoice.status.toUpperCase()}
----------------------------------------
Monthly Base Rent: Rs. ${invoice.rent_due.toLocaleString()}
Electricity: Rs. ${invoice.electricity_due.toLocaleString()}
Water Flat Fee: Rs. ${invoice.water_due.toLocaleString()}
Waste Management: Rs. ${invoice.waste_due.toLocaleString()}
${invoice.arrears_carried_forward > 0 ? `Previous Arrears: Rs. ${invoice.arrears_carried_forward.toLocaleString()}\n` : ''}----------------------------------------
Total: Rs. ${invoice.total_due.toLocaleString()}
----------------------------------------
${isPaid ? 'Thank you! The payment has been verified and recorded.' : 'Please pay the outstanding dues via cash or digital transfer.'}

Generated via GharKoHisaab App.`;

      await Share.share({
        message,
        title,
      });
    } catch (error) {
      console.error('Error sharing invoice:', error);
    }
  };

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading Billing Ledger...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Alert Card for Pending Invoice */}
      {isCurrentPeriodPending() && (
        <View style={styles.pendingAlertCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pendingAlertTitle}>Billing Action Required</Text>
            <Text style={styles.pendingAlertSubtitle}>
              Monthly invoice for **{currentPeriod}** is pending generation.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.generateBtn}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.generateBtnText}>Bill Now</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Invoices List */}
      <View style={styles.listHeaderContainer}>
        <Text style={styles.listHeaderTitle}>Invoice History</Text>
      </View>

      {invoices.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No invoices generated for this tenant yet.</Text>
        </View>
      ) : (
        <FlatList
          data={invoices}
          keyExtractor={(item) => item.id}
          scrollEnabled={false} // Rendered inside parent scrollview
          renderItem={({ item }) => (
            <View style={styles.invoiceCard}>
              <View style={styles.invoiceCardHeader}>
                <Text style={styles.invoicePeriod}>{item.billing_period}</Text>
                <View
                  style={[
                    styles.badge,
                    item.status === 'paid'
                      ? styles.badgePaid
                      : item.status === 'partially_paid'
                      ? styles.badgePartial
                      : styles.badgeUnpaid,
                  ]}
                >
                  <Text
                    style={[
                      styles.badgeText,
                      item.status === 'paid'
                        ? styles.badgeTextPaid
                        : item.status === 'partially_paid'
                        ? styles.badgeTextPartial
                        : styles.badgeTextUnpaid,
                    ]}
                  >
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <View style={styles.invoiceCardBody}>
                <Text style={styles.totalDue}>Rs. {item.total_due.toLocaleString()}</Text>
                
                <Text style={styles.invoiceBreakdown}>
                  Rent: Rs. {item.rent_due.toLocaleString()} | Elec: Rs. {item.electricity_due.toLocaleString()} | Water: Rs. {item.water_due.toLocaleString()} | Waste: Rs. {item.waste_due.toLocaleString()}
                  {item.arrears_carried_forward > 0 && ` | Arrears: Rs. ${item.arrears_carried_forward.toLocaleString()}`}
                </Text>

                <View style={styles.actionRow}>
                  {item.status !== 'paid' && (
                    <TouchableOpacity
                      style={styles.payBtn}
                      onPress={() => setSelectedInvoiceForPayment(item)}
                    >
                      <Text style={styles.payBtnText}>Record Payment</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={[styles.shareBtn, item.status === 'paid' && styles.shareBtnPaidOnly]}
                    onPress={() => handleShareInvoice(item)}
                  >
                    <Text style={[styles.shareBtnText, item.status === 'paid' && styles.shareBtnTextPaidOnly]}>
                      {item.status === 'paid' ? '📤 Share Receipt' : '📤 Share Bill'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      {/* Record Dues & Generate Invoice Modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalTitle}>Generate Invoice ({currentPeriod})</Text>

              {/* Base Rent Display */}
              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyLabel}>Monthly Rent (Base)</Text>
                <Text style={styles.readOnlyVal}>Rs. {baseRent.toLocaleString()}</Text>
              </View>

              {/* Arrears Display */}
              {arrears > 0 && (
                <View style={[styles.readOnlyRow, { backgroundColor: 'rgba(211, 84, 0, 0.05)' }]}>
                  <Text style={styles.readOnlyLabel}>Outstanding Arrears (बाँकी)</Text>
                  <Text style={[styles.readOnlyVal, { color: COLORS.accentOrange }]}>
                    Rs. {arrears.toLocaleString()}
                  </Text>
                </View>
              )}

              {/* Electricity readings */}
              <View style={styles.sectionDivider} />
              <Text style={styles.modalSectionHeader}>⚡ Electricity Sub-Meter Reading</Text>

              <View style={styles.readOnlyRow}>
                <Text style={styles.readOnlyLabel}>Previous Reading</Text>
                <Text style={styles.readOnlyVal}>
                  {lastReading ? `${lastReading.electricity_reading} units` : '0 units (First Bill)'}
                </Text>
              </View>

              <Text style={styles.label}>Current Reading (units) *</Text>
              <TextInput
                style={styles.input}
                placeholder={`e.g., must be >= ${lastReading?.electricity_reading || 0}`}
                keyboardType="numeric"
                value={currElectricity}
                onChangeText={setCurrElectricity}
              />

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Unit Rate (Rs.)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="12"
                    keyboardType="numeric"
                    value={electricityRate}
                    onChangeText={setElectricityRate}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8, justifyContent: 'center' }}>
                  <Text style={styles.calculatedHelpLabel}>Consumed Units</Text>
                  <Text style={styles.calculatedHelpVal}>{getElectricityUnits()} units</Text>
                </View>
              </View>

              {/* Other Flat Dues */}
              <View style={styles.sectionDivider} />
              <Text style={styles.modalSectionHeader}>🚰 Shared Flat Utilities</Text>

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text style={styles.label}>Water Fee (Rs.)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="500"
                    keyboardType="numeric"
                    value={waterFee}
                    onChangeText={setWaterFee}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.label}>Waste Fee (Rs.)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="150"
                    keyboardType="numeric"
                    value={wasteFee}
                    onChangeText={setWasteFee}
                  />
                </View>
              </View>

              {/* Total Calculation Display */}
              <View style={styles.totalSummaryContainer}>
                <Text style={styles.totalSummaryLabel}>Total Calculated Bill:</Text>
                <Text style={styles.totalSummaryVal}>Rs. {calculateLiveTotal().toLocaleString()}</Text>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setIsModalVisible(false)}
                  disabled={isGenerating}
                >
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnSave]}
                  onPress={() => handleGenerateInvoice(() => setIsModalVisible(false))}
                  disabled={isGenerating}
                >
                  <Text style={styles.modalBtnSaveText}>
                    {isGenerating ? 'Generating...' : 'Confirm & Bill'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Record Payment Modal */}
      {selectedInvoiceForPayment && (
        <PaymentModal
          isVisible={!!selectedInvoiceForPayment}
          onClose={async () => {
            setSelectedInvoiceForPayment(null);
            // Reload invoices and arrears status after payment confirmation
            await refreshRecords();
          }}
          invoiceId={selectedInvoiceForPayment.id}
          totalDue={selectedInvoiceForPayment.total_due}
          billingPeriod={selectedInvoiceForPayment.billing_period}
          tenantPhone={tenantPhone}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  pendingAlertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(211, 84, 0, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.accentOrange,
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
  },
  pendingAlertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accentOrange,
  },
  pendingAlertSubtitle: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  generateBtn: {
    backgroundColor: COLORS.accentOrange,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    marginLeft: 8,
  },
  generateBtnText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 13,
  },
  listHeaderContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  listHeaderTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  invoiceCard: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
  },
  invoiceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  invoicePeriod: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  badgePaid: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  badgePartial: {
    backgroundColor: 'rgba(52, 152, 219, 0.1)',
  },
  badgeUnpaid: {
    backgroundColor: 'rgba(211, 84, 0, 0.1)',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  badgeTextPaid: {
    color: COLORS.accentGreen,
  },
  badgeTextPartial: {
    color: '#3498db',
  },
  badgeTextUnpaid: {
    color: COLORS.accentOrange,
  },
  invoiceCardBody: {
    marginTop: 4,
  },
  totalDue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  invoiceBreakdown: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 6,
    lineHeight: 15,
    marginBottom: 8,
  },
  payBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    marginRight: 8,
  },
  payBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: 'bold',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  shareBtn: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  shareBtnPaidOnly: {
    borderColor: COLORS.accentGreen,
  },
  shareBtnText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  shareBtnTextPaidOnly: {
    color: COLORS.accentGreen,
  },
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
  modalSectionHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 14,
    marginBottom: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 14,
  },
  readOnlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 6,
    marginBottom: 8,
  },
  readOnlyLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  readOnlyVal: {
    fontSize: 13,
    fontWeight: '600',
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
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 6,
  },
  rowInputs: {
    flexDirection: 'row',
  },
  calculatedHelpLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 10,
    textAlign: 'center',
  },
  calculatedHelpVal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginTop: 4,
  },
  totalSummaryContainer: {
    backgroundColor: 'rgba(39, 174, 96, 0.08)',
    borderWidth: 1,
    borderColor: COLORS.accentGreen,
    borderRadius: 8,
    padding: 14,
    marginVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalSummaryLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  totalSummaryVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
