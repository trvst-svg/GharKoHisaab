import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import { z } from 'zod';
import { initConnection } from '../../database/connection';
import {
  initPostingSchema,
  addRoomPosting,
  updateRoomPosting,
  deleteRoomPosting,
  getPostingForRoom,
  getAllPublicPostings,
  RoomPosting,
  PublicPostingItem,
} from './PostingModel';

export function useListingController(roomId: string, houseId: string, onSuccess?: () => void) {
  const [dbReady, setDbReady] = useState(false);
  const [existingPosting, setExistingPosting] = useState<RoomPosting | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initConnection();
        await initPostingSchema();
        
        // Check if there is an existing posting for this room
        const posting = await getPostingForRoom(roomId);
        if (posting) {
          setExistingPosting(posting);
          setTitle(posting.title);
          setDescription(posting.description);
          setContactPhone(posting.contact_phone);
        }
        setDbReady(true);
      } catch (error) {
        console.error('Failed to initialize listing controller:', error);
      }
    }
    setup();
  }, [roomId]);

  const postingSchema = z.object({
    title: z.string().trim().min(1, 'Title is required.'),
    description: z.string().trim(),
    contactPhone: z.string().trim().min(1, 'Contact Phone is required.'),
  });

  const handlePublish = async () => {
    const result = postingSchema.safeParse({ title, description, contactPhone });
    if (!result.success) {
      Alert.alert('Validation Error', result.error.issues[0].message);
      return;
    }

    setIsSaving(true);
    try {
      const postingId = Crypto.randomUUID();
      const newPosting: RoomPosting = {
        id: postingId,
        room_id: roomId,
        house_id: houseId,
        title: title.trim(),
        description: description.trim(),
        contact_phone: contactPhone.trim(),
        is_active: 1,
        created_at: new Date().toISOString(),
      };

      await addRoomPosting(newPosting);
      setExistingPosting(newPosting);
      Alert.alert('Success', 'Room listing published successfully on the marketplace.');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to publish listing:', error);
      Alert.alert('Error', 'Failed to publish listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!existingPosting) return;
    const result = postingSchema.safeParse({ title, description, contactPhone });
    if (!result.success) {
      Alert.alert('Validation Error', result.error.issues[0].message);
      return;
    }

    setIsSaving(true);
    try {
      await updateRoomPosting(existingPosting.id, title.trim(), description.trim(), contactPhone.trim());
      setExistingPosting({
        ...existingPosting,
        title: title.trim(),
        description: description.trim(),
        contact_phone: contactPhone.trim(),
      });
      Alert.alert('Success', 'Listing updated successfully.');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Failed to update listing:', error);
      Alert.alert('Error', 'Failed to update listing.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!existingPosting) return;

    Alert.alert(
      'Remove Listing',
      'Are you sure you want to remove this listing from the public marketplace?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setIsSaving(true);
            try {
              await deleteRoomPosting(existingPosting.id);
              setExistingPosting(null);
              setTitle('');
              setDescription('');
              setContactPhone('');
              Alert.alert('Success', 'Listing removed from the marketplace.');
              if (onSuccess) onSuccess();
            } catch (error) {
              console.error('Failed to delete listing:', error);
              Alert.alert('Error', 'Failed to remove listing.');
            } finally {
              setIsSaving(false);
            }
          },
        },
      ]
    );
  };

  return {
    dbReady,
    existingPosting,
    title,
    setTitle,
    description,
    setDescription,
    contactPhone,
    setContactPhone,
    isSaving,
    handlePublish,
    handleUpdate,
    handleRemove,
  };
}

export function useMarketplaceController() {
  const [dbReady, setDbReady] = useState(false);
  const [postings, setPostings] = useState<PublicPostingItem[]>([]);
  const [filteredPostings, setFilteredPostings] = useState<PublicPostingItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [maxRent, setMaxRent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPostings = async () => {
    setIsLoading(true);
    try {
      await initConnection();
      await initPostingSchema();
      const items = await getAllPublicPostings();
      setPostings(items);
      setFilteredPostings(items);
      setDbReady(true);
    } catch (error) {
      console.error('Failed to load marketplace postings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPostings();
  }, []);

  // Filter listings in real time based on search queries
  useEffect(() => {
    let result = postings;

    // Filter by location
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        item =>
          item.house_address.toLowerCase().includes(q) ||
          item.house_name.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q)
      );
    }

    // Filter by maximum rent
    const maxVal = parseFloat(maxRent.trim());
    if (!isNaN(maxVal) && maxVal > 0) {
      result = result.filter(item => item.base_rent <= maxVal);
    }

    setFilteredPostings(result);
  }, [searchQuery, maxRent, postings]);

  return {
    dbReady,
    postings,
    filteredPostings,
    searchQuery,
    setSearchQuery,
    maxRent,
    setMaxRent,
    isLoading,
    refreshListings: fetchPostings,
  };
}
