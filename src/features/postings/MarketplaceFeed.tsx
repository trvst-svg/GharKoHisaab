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
          key={Platform.OS === 'web' ? 'web-grid' : 'mobile-list'}
          numColumns={Platform.OS === 'web' ? 2 : 1}
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 10,
    fontWeight: '600',
  },
  header: {
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
      }
    })
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  filterCard: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
        borderRadius: 12,
        marginTop: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      }
    })
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  searchLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  searchInput: {
    flex: 2,
    height: 40,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 13,
    color: COLORS.textPrimary,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
    ...Platform.select({
      web: {
        maxWidth: 1000,
        width: '100%',
        alignSelf: 'center',
      }
    })
  },
  listingCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    ...Platform.select({
      web: {
        flex: 1,
        marginHorizontal: 6,
        minWidth: '45%',
      }
    })
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  cardRoomInfo: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  rentBadge: {
    alignItems: 'flex-end',
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rentText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.accentGreen,
  },
  rentPeriod: {
    fontSize: 9,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    color: COLORS.textPrimary,
    lineHeight: 18,
    marginBottom: 14,
  },
  cardLocationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
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
    letterSpacing: 0.5,
  },
  ownerValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  callBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 14,
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
    padding: 32,
  },
  emptyTextIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTextTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  emptyTextSub: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: 'bold',
  },
});
