import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Crypto from 'expo-crypto';
import { z } from 'zod';
import { initConnection } from '../../database/connection';
import {
  initPropertySchema,
  getHouses,
  addHouse,
  getRoomsForHouse,
  addRoom,
  deleteRoom,
  House,
  Room,
} from './PropertyModel';

export function usePropertyController() {
  const [dbReady, setDbReady] = useState(false);
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Wizard Setup Form
  const [housekeeperName, setHousekeeperName] = useState('');
  const [customHouseName, setCustomHouseName] = useState('');
  const [address, setAddress] = useState('');

  // Add Room Form
  const [isRoomModalVisible, setIsRoomModalVisible] = useState(false);
  const [roomNumber, setRoomNumber] = useState('');
  const [baseRent, setBaseRent] = useState('');
  const [roomStatus, setRoomStatus] = useState<'vacant' | 'occupied'>('vacant');

  // Bootstrapping the database connections and schemas
  useEffect(() => {
    async function setup() {
      try {
        await initConnection();
        await initPropertySchema();
        setDbReady(true);
        await loadHouses();
      } catch (error) {
        console.error('Feature Property initialization failed:', error);
        Alert.alert('Error', 'Failed to initialize database connection.');
      }
    }
    setup();
  }, []);

  const loadHouses = async () => {
    try {
      const allHouses = await getHouses();
      setHouses(allHouses);
      if (allHouses.length > 0) {
        setSelectedHouse(allHouses[0]);
      } else {
        setSelectedHouse(null);
      }
    } catch (error) {
      console.error('Failed to load houses:', error);
    }
  };

  useEffect(() => {
    if (selectedHouse) {
      loadRooms(selectedHouse.id);
    } else {
      setRooms([]);
    }
  }, [selectedHouse]);

  const loadRooms = async (houseId: string) => {
    try {
      const allRooms = await getRoomsForHouse(houseId);
      setRooms(allRooms);
    } catch (error) {
      console.error('Failed to load rooms:', error);
    }
  };

  const handleHousekeeperNameChange = (name: string) => {
    setHousekeeperName(name);
    if (name.trim()) {
      const count = houses.length + 1;
      setCustomHouseName(`${name.trim()}'s House ${count}`);
    } else {
      setCustomHouseName('');
    }
  };

  const houseSchema = z.object({
    housekeeperName: z.string().trim().min(1, 'Housekeeper name is required.'),
    customHouseName: z.string().trim().min(1, 'House name is required.'),
    address: z.string().trim().min(1, 'Address is required.'),
  });

  const roomSchema = z.object({
    roomNumber: z.string().trim().min(1, 'Room number is required.'),
    baseRent: z.string().trim().refine((val) => {
      const parsed = parseFloat(val);
      return !isNaN(parsed) && parsed > 0;
    }, 'Please enter a valid rent amount.'),
  });

  const handleCreateProperty = async () => {
    const result = houseSchema.safeParse({ housekeeperName, customHouseName, address });
    if (!result.success) {
      Alert.alert('Validation Error', result.error.issues[0].message);
      return;
    }

    const newHouseId = Crypto.randomUUID();
    const newHousePayload: House = {
      id: newHouseId,
      housekeeper_name: housekeeperName.trim(),
      name: customHouseName.trim(),
      address: address.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      await addHouse(newHousePayload);
      setHousekeeperName('');
      setCustomHouseName('');
      setAddress('');
      await loadHouses();
    } catch (error) {
      console.error('Failed to create property:', error);
      Alert.alert('Error', 'Failed to create property.');
    }
  };

  const handleCreateRoom = async () => {
    if (!selectedHouse) return;

    const result = roomSchema.safeParse({ roomNumber, baseRent });
    if (!result.success) {
      Alert.alert('Validation Error', result.error.issues[0].message);
      return;
    }

    const rentNumber = parseFloat(baseRent);

    const newRoomId = Crypto.randomUUID();
    const newRoomPayload: Room = {
      id: newRoomId,
      house_id: selectedHouse.id,
      room_number: roomNumber.trim(),
      base_rent: rentNumber,
      status: roomStatus,
      created_at: new Date().toISOString(),
    };

    try {
      await addRoom(newRoomPayload);
      setRoomNumber('');
      setBaseRent('');
      setRoomStatus('vacant');
      setIsRoomModalVisible(false);
      await loadRooms(selectedHouse.id);
    } catch (error) {
      console.error('Failed to add room:', error);
      Alert.alert('Error', 'Failed to add room.');
    }
  };

  const handleDeleteRoom = (roomId: string, roomNum: string) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete Room ${roomNum}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!selectedHouse) return;
            try {
              await deleteRoom(roomId);
              await loadRooms(selectedHouse.id);
            } catch (error) {
              console.error('Failed to delete room:', error);
            }
          },
        },
      ]
    );
  };

  const triggerAddAnotherHouse = () => {
    setHouses([]);
    setSelectedHouse(null);
  };

  return {
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
  };
}
