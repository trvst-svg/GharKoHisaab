import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { usePropertyController } from '../../controllers/usePropertyController';

export default function PropertyScreen() {
  const {
    dbReady,
    houses,
    selectedHouse,
    rooms,
    housekeeperName,
    customHouseName,
    address,
    isRoomModalVisible,
    roomNumber,
    baseRent,
    roomStatus,
    setCustomHouseName,
    setAddress,
    setIsRoomModalVisible,
    setRoomNumber,
    setBaseRent,
    setRoomStatus,
    handleHousekeeperNameChange,
    handleCreateProperty,
    handleCreateRoom,
    handleDeleteRoom,
    triggerAddAnotherHouse,
  } = usePropertyController();

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing system...</Text>
      </View>
    );
  }

  // If no properties exist, show onboarding Property Setup Wizard
  if (houses.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={styles.wizardScroll}>
            <View style={styles.wizardHeader}>
              <Text style={styles.title}>GharKoHisaab 🏡</Text>
              <Text style={styles.subtitle}>Setup Your First Property</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.label}>Housekeeper (Landlord) Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Shyam Bahadur"
                value={housekeeperName}
                onChangeText={handleHousekeeperNameChange}
                placeholderTextColor={COLORS.textSecondary}
              />

              {customHouseName.length > 0 && (
                <View style={styles.suggestedContainer}>
                  <Text style={styles.suggestedTitle}>Suggested Property Name:</Text>
                  <TextInput
                    style={[styles.input, styles.suggestedInput]}
                    value={customHouseName}
                    onChangeText={setCustomHouseName}
                    placeholder="e.g., Shyam's House 1"
                    placeholderTextColor={COLORS.textSecondary}
                  />
                  <Text style={styles.suggestedHelp}>
                    Auto-generated from your name. You can customize it if you want.
                  </Text>
                </View>
              )}

              <Text style={styles.label}>House Location / Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Sanepa, Lalitpur"
                value={address}
                onChangeText={setAddress}
                placeholderTextColor={COLORS.textSecondary}
              />

              <TouchableOpacity
                onPress={handleCreateProperty}
                style={[
                  styles.button,
                  (!housekeeperName.trim() || !address.trim() || !customHouseName.trim()) &&
                    styles.buttonDisabled,
                ]}
                disabled={!housekeeperName.trim() || !address.trim() || !customHouseName.trim()}
              >
                <Text style={styles.buttonText}>Create Property</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerSubtitle}>Property Dashboard</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {selectedHouse?.name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={triggerAddAnotherHouse}
          style={styles.headerBtn}
        >
          <Text style={styles.headerBtnText}>+ Add House</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.addressBar}>
        <Text style={styles.addressText}>📍 {selectedHouse?.address}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rooms & Flats ({rooms.length})</Text>
          <TouchableOpacity
            style={styles.addRoomBtn}
            onPress={() => setIsRoomModalVisible(true)}
          >
            <Text style={styles.addRoomBtnText}>+ Add Room</Text>
          </TouchableOpacity>
        </View>

        {rooms.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No rooms added to this house yet.</Text>
            <TouchableOpacity
              style={[styles.button, { marginTop: 16 }]}
              onPress={() => setIsRoomModalVisible(true)}
            >
              <Text style={styles.buttonText}>Add Your First Room</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.roomCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.roomNumber}>Room / Flat {item.room_number}</Text>
                  <Text style={styles.roomRent}>Rent: Rs. {item.base_rent.toLocaleString()}</Text>
                </View>
                <View style={styles.rightAction}>
                  <View
                    style={[
                      styles.badge,
                      item.status === 'vacant' ? styles.badgeVacant : styles.badgeOccupied,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        item.status === 'vacant' ? styles.badgeTextVacant : styles.badgeTextOccupied,
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteRoom(item.id, item.room_number)}
                    style={styles.deleteBtn}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>

      {/* Add Room Modal */}
      <Modal visible={isRoomModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Add New Room</Text>

            <Text style={styles.label}>Room Number or Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Room 101 or Ground Floor Flat"
              value={roomNumber}
              onChangeText={setRoomNumber}
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Monthly Base Rent (Rs.)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 12000"
              keyboardType="numeric"
              value={baseRent}
              onChangeText={setBaseRent}
              placeholderTextColor={COLORS.textSecondary}
            />

            <Text style={styles.label}>Initial Status</Text>
            <View style={styles.statusToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  roomStatus === 'vacant' && styles.statusToggleBtnActive,
                ]}
                onPress={() => setRoomStatus('vacant')}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    roomStatus === 'vacant' && styles.statusToggleTextActive,
                  ]}
                >
                  Vacant
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.statusToggleBtn,
                  roomStatus === 'occupied' && styles.statusToggleBtnActive,
                ]}
                onPress={() => setRoomStatus('occupied')}
              >
                <Text
                  style={[
                    styles.statusToggleText,
                    roomStatus === 'occupied' && styles.statusToggleTextActive,
                  ]}
                >
                  Occupied
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setIsRoomModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleCreateRoom}
              >
                <Text style={styles.modalBtnSaveText}>Save Room</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  wizardScroll: {
    padding: 24,
    justifyContent: 'center',
  },
  wizardHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: 15,
    marginBottom: 8,
  },
  suggestedContainer: {
    backgroundColor: 'rgba(44, 62, 80, 0.05)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  suggestedTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 6,
  },
  suggestedInput: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.border,
  },
  suggestedHelp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  button: {
    height: 48,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginTop: 2,
  },
  headerBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  headerBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  addressBar: {
    backgroundColor: COLORS.cardBackground,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  addRoomBtn: {
    backgroundColor: COLORS.accentOrange,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  addRoomBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 20,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  roomNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  roomRent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  badgeVacant: {
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
  },
  badgeOccupied: {
    backgroundColor: 'rgba(211, 84, 0, 0.1)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  badgeTextVacant: {
    color: COLORS.accentGreen,
  },
  badgeTextOccupied: {
    color: COLORS.accentOrange,
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  deleteBtnText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: '600',
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
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  statusToggleBtn: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  statusToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  statusToggleText: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  statusToggleTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
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
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnSave: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  modalBtnSaveText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
