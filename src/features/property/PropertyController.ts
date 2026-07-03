import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
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

  const handleCreateProperty = async () => {
    if (!housekeeperName.trim() || !address.trim() || !customHouseName.trim()) {
      Alert.alert('Validation Error', 'Please fill in all details.');
      return;
    }

    const newHouseId = Math.random().toString(36).substring(2, 15);
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
    if (!roomNumber.trim() || !baseRent.trim()) {
      Alert.alert('Validation Error', 'Please enter room number and rent.');
      return;
    }

    const rentNumber = parseFloat(baseRent);
    if (isNaN(rentNumber) || rentNumber <= 0) {
      Alert.alert('Validation Error', 'Please enter a valid rent amount.');
      return;
    }

    const newRoomId = Math.random().toString(36).substring(2, 15);
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
  };
}
