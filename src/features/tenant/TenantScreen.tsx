import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useTenantController } from './TenantController';
import NepaliDate from 'nepali-date-converter';

interface TenantScreenProps {
  roomId: string;
  roomNumber: string;
  onBack: () => void;
}

export default function TenantScreen({ roomId, roomNumber, onBack }: TenantScreenProps) {
  const {
    dbReady,
    activeTenancy,
    name,
    setName,
    phone,
    setPhone,
    idType,
    setIdType,
    idPhotoUri,
    setIdPhotoUri,
    deposit,
    setDeposit,
    bsYear,
    setBsYear,
    bsMonth,
    setBsMonth,
    bsDay,
    setBsDay,
    handleTakePhoto,
    handlePickPhoto,
    handleOnboardTenant,
  } = useTenantController(roomId, onBack);

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Render view mode if room is occupied by an active tenant
  if (activeTenancy) {
    const startAD = new Date(activeTenancy.start_date);
    const startBS = new NepaliDate(startAD);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Room {roomNumber} Tenant</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.contentScroll}>
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Active Tenancy Details</Text>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tenant Name</Text>
              <Text style={styles.detailValue}>{activeTenancy.tenant_name}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone Number</Text>
              <Text style={styles.detailValue}>{activeTenancy.tenant_phone}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rent Start Date (B.S.)</Text>
              <Text style={styles.detailValue}>
                {startBS.format('YYYY MMMM DD')} ({startBS.format('YYYY-MM-DD')})
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Security Deposit (Dharauti)</Text>
              <Text style={[styles.detailValue, styles.depositText]}>
                Rs. {activeTenancy.security_deposit_amount.toLocaleString()}
              </Text>
            </View>
          </View>

          {activeTenancy.tenant_id_url && (
            <View style={styles.card}>
              <Text style={styles.sectionHeader}>
                Uploaded ID ({activeTenancy.tenant_id_type.toUpperCase()})
              </Text>
              <Image source={{ uri: activeTenancy.tenant_id_url }} style={styles.idImagePreview} />
            </View>
          )}

          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>Close Profile</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Render onboarding wizard form if room is vacant
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rent Room {roomNumber}</Text>
        <View style={{ width: 60 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.contentScroll}>
          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Tenant Information</Text>

            <Text style={styles.label}>Tenant Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Ram Kumar Shrestha"
              value={name}
              onChangeText={setName}
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 98XXXXXXXX"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Rental Terms</Text>

            <Text style={styles.label}>Tenancy Start Date (B.S. Calendar) *</Text>
            <View style={styles.dateInputsContainer}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Year (YYYY)</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="2083"
                  keyboardType="numeric"
                  maxLength={4}
                  value={bsYear}
                  onChangeText={setBsYear}
                />
              </View>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Month (MM)</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="03"
                  keyboardType="numeric"
                  maxLength={2}
                  value={bsMonth}
                  onChangeText={setBsMonth}
                />
              </View>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Day (DD)</Text>
                <TextInput
                  style={[styles.input, styles.dateInput]}
                  placeholder="15"
                  keyboardType="numeric"
                  maxLength={2}
                  value={bsDay}
                  onChangeText={setBsDay}
                />
              </View>
            </View>

            <Text style={styles.label}>Security Deposit (Dharauti - Rs.)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 10000 (leave 0 if none)"
              keyboardType="numeric"
              value={deposit}
              onChangeText={setDeposit}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionHeader}>Government ID Proof</Text>

            <Text style={styles.label}>ID Document Type</Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleBtn, idType === 'citizenship' && styles.toggleBtnActive]}
                onPress={() => setIdType('citizenship')}
              >
                <Text style={[styles.toggleText, idType === 'citizenship' && styles.toggleTextActive]}>
                  Citizenship
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, idType === 'license' && styles.toggleBtnActive]}
                onPress={() => setIdType('license')}
              >
                <Text style={[styles.toggleText, idType === 'license' && styles.toggleTextActive]}>
                  License
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, idType === 'passport' && styles.toggleBtnActive]}
                onPress={() => setIdType('passport')}
              >
                <Text style={[styles.toggleText, idType === 'passport' && styles.toggleTextActive]}>
                  Passport
                </Text>
              </TouchableOpacity>
            </View>

            {idPhotoUri ? (
              <View style={styles.photoPreviewContainer}>
                <Image source={{ uri: idPhotoUri }} style={styles.imagePreview} />
                <TouchableOpacity onPress={() => setIdPhotoUri(null)} style={styles.removePhotoBtn}>
                  <Text style={styles.removePhotoText}>Remove Photo</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.photoActionsContainer}>
                <TouchableOpacity style={styles.photoBtn} onPress={handleTakePhoto}>
                  <Text style={styles.photoBtnText}>📸 Take ID Photo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoBtn} onPress={handlePickPhoto}>
                  <Text style={styles.photoBtnText}>🖼️ Upload from Gallery</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleOnboardTenant}>
            <Text style={styles.saveBtnText}>Save & Onboard Tenant</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backBtnText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  contentScroll: {
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  label: {
    fontSize: 13,
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
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  depositText: {
    color: COLORS.accentGreen,
  },
  idImagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
    marginTop: 8,
  },
  backButton: {
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  backButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  dateInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateField: {
    flex: 1,
    marginHorizontal: 4,
  },
  dateLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateInput: {
    textAlign: 'center',
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
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  toggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  toggleText: {
    fontSize: 12,
    color: COLORS.textPrimary,
  },
  toggleTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  photoActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  photoBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  photoBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  photoPreviewContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  removePhotoBtn: {
    marginTop: 8,
    padding: 6,
  },
  removePhotoText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: '600',
  },
  saveBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.accentOrange,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  saveBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
