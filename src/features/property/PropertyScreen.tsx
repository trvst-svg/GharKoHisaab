import React, { useState } from 'react';
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
import { usePropertyController } from './PropertyController';
import TenantScreen from '../tenant/TenantScreen';
import MarketplaceFeed from '../postings/MarketplaceFeed';

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
    loadRooms,
  } = usePropertyController();

  // Navigation/Routing state for active room tenant management
  const [activeRoomForTenant, setActiveRoomForTenant] = useState<{ id: string; roomNumber: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace'>('dashboard');

  if (!dbReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Initializing system...</Text>
      </View>
    );
  }

  // Render Tenant details or onboarding screen if selected
  if (activeRoomForTenant) {
    return (
      <TenantScreen
        roomId={activeRoomForTenant.id}
        roomNumber={activeRoomForTenant.roomNumber}
        houseId={selectedHouse?.id || ''}
        onBack={async () => {
          setActiveRoomForTenant(null);
          // Reload room list to show updated occupancy status
          if (selectedHouse) {
            await loadRooms(selectedHouse.id);
          }
        }}
      />
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
      <View style={{ flex: 1 }}>
        {activeTab === 'dashboard' ? (
          <>
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
                  key={Platform.OS === 'web' ? 'web-grid' : 'mobile-list'}
                  numColumns={Platform.OS === 'web' ? 2 : 1}
                  data={rooms}
                  keyExtractor={(item) => item.id}
                  contentContainerStyle={styles.listContainer}
                  renderItem={({ item }) => (
                    <View style={styles.roomCard}>
                      <TouchableOpacity
                        style={styles.roomInfoContainer}
                        onPress={() => setActiveRoomForTenant({ id: item.id, roomNumber: item.room_number })}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.roomNumber}>Room / Flat {item.room_number}</Text>
                          <Text style={styles.roomRent}>Rent: Rs. {(item.base_rent ?? 0).toLocaleString()}</Text>
                        </View>
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
                      </TouchableOpacity>
                      <View style={styles.rightAction}>
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
          </>
        ) : (
          <MarketplaceFeed />
        )}
      </View>

      {/* Bottom Navigation Tab Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'dashboard' && styles.tabItemActive]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.tabItemText, activeTab === 'dashboard' && styles.tabItemTextActive]}>
            🏠 Dashboard
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'marketplace' && styles.tabItemActive]}
          onPress={() => setActiveTab('marketplace')}
        >
          <Text style={[styles.tabItemText, activeTab === 'marketplace' && styles.tabItemTextActive]}>
            🌐 Marketplace
          </Text>
        </TouchableOpacity>
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

            <Text style={styles.label}>Room Occupancy Status</Text>
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
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  wizardScroll: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wizardHeader: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    maxWidth: 500,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
    marginTop: 14,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    backgroundColor: COLORS.white,
    color: COLORS.textPrimary,
    fontSize: 14,
    marginBottom: 8,
  },
  suggestedContainer: {
    backgroundColor: '#F5F3FF',
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#DDD6FE',
  },
  suggestedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  suggestedInput: {
    backgroundColor: COLORS.white,
    borderColor: '#C7D2FE',
  },
  suggestedHelp: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  button: {
    height: 46,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
        borderBottomWidth: 0,
      }
    })
  },
  headerSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  headerBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  headerBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  addressBar: {
    backgroundColor: COLORS.white,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
      }
    })
  },
  addressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
      }
    })
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
    color: COLORS.textPrimary,
  },
  addRoomBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addRoomBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  listContainer: {
    paddingBottom: 24,
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    paddingRight: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    ...Platform.select({
      web: {
        flex: 1,
        marginHorizontal: 6,
        minWidth: '45%',
      }
    })
  },
  roomInfoContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingLeft: 18,
  },
  roomNumber: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  roomRent: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '500',
  },
  rightAction: {
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 100,
    alignSelf: 'center',
    marginRight: 12,
  },
  badgeVacant: {
    backgroundColor: '#DEF7EC',
  },
  badgeOccupied: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  badgeTextVacant: {
    color: COLORS.accentGreen,
  },
  badgeTextOccupied: {
    color: '#D97706',
  },
  deleteBtn: {
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deleteBtnText: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: 'bold',
  },
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 16,
    textAlign: 'center',
  },
  statusToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 24,
  },
  statusToggleBtn: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  statusToggleBtnActive: {
    backgroundColor: COLORS.primary,
  },
  statusToggleText: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  statusToggleTextActive: {
    color: COLORS.white,
    fontWeight: 'bold',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  modalBtn: {
    flex: 1,
    height: 46,
    borderRadius: 10,
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
  bottomTabBar: {
    flexDirection: 'row',
    height: 56,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        borderRadius: 12,
        marginBottom: 16,
      }
    })
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: COLORS.primary,
  },
  tabItemText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  tabItemTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});
