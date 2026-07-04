import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { useMarketplaceController } from './PostingController';

export default function MarketplaceFeed() {
  const {
    dbReady,
    filteredPostings,
    searchQuery,
    setSearchQuery,
    maxRent,
    setMaxRent,
    isLoading,
    refreshListings,
  } = useMarketplaceController();

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`).catch(err => {
      alert('Unable to launch phone dialer.');
    });
  };

  if (!dbReady && isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Connecting to Rental Marketplace...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GharKoHisaab Marketplace 🌐</Text>
        <Text style={styles.headerSubtitle}>Discover vacant rooms in Kathmandu</Text>
      </View>

      {/* Filter panel */}
      <View style={styles.filterCard}>
        <View style={styles.searchRow}>
          <Text style={styles.searchLabel}>📍 Filter by Location</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search e.g. Sanepa, Kalimati"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        <View style={styles.searchRow}>
          <Text style={styles.searchLabel}>💰 Max Rent Budget (Rs.)</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="e.g. 15000"
            keyboardType="numeric"
            value={maxRent}
            onChangeText={setMaxRent}
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>
      </View>

      {/* Listings list */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
        </View>
      ) : filteredPostings.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTextIcon}>📭</Text>
          <Text style={styles.emptyTextTitle}>No Vacant Rooms Listed</Text>
          <Text style={styles.emptyTextSub}>
            Try clearing your filters or check back later for new room ads.
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={refreshListings}>
            <Text style={styles.retryBtnText}>Refresh Marketplace</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPostings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshing={isLoading}
          onRefresh={refreshListings}
          renderItem={({ item }) => (
            <View style={styles.listingCard}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardRoomInfo}>
                    Room {item.room_number} • {item.house_name}
                  </Text>
                </View>
                <View style={styles.rentBadge}>
                  <Text style={styles.rentText}>Rs. {item.base_rent.toLocaleString()}</Text>
                  <Text style={styles.rentPeriod}>/month</Text>
                </View>
              </View>

              <Text style={styles.cardDescription}>
                {item.description || 'No description provided.'}
              </Text>

              <View style={styles.cardLocationBox}>
                <Text style={styles.locationText}>📍 {item.house_address}</Text>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.ownerInfo}>
                  <Text style={styles.ownerLabel}>Owner / Contact</Text>
                  <Text style={styles.ownerValue}>{item.housekeeper_name}</Text>
                </View>

                <TouchableOpacity
                  style={styles.callBtn}
                  onPress={() => handleCall(item.contact_phone)}
                >
                  <Text style={styles.callBtnText}>📞 Call {item.contact_phone}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
    fontWeight: '600',
  },
  header: {
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
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterCard: {
    backgroundColor: COLORS.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    padding: 14,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  searchLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.primary,
    flex: 1,
  },
  searchInput: {
    flex: 2,
    height: 36,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  listingCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  cardRoomInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rentBadge: {
    alignItems: 'flex-end',
    backgroundColor: 'rgba(39, 174, 96, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 0.5,
    borderColor: COLORS.accentGreen,
  },
  rentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
  },
  rentPeriod: {
    fontSize: 9,
    color: COLORS.textSecondary,
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 12,
  },
  cardLocationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  locationText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ownerInfo: {
    flex: 1,
  },
  ownerLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  ownerValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  callBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  callBtnText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyTextIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  emptyTextTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 6,
  },
  emptyTextSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
