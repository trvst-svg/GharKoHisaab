import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import NepaliDate from 'nepali-date-converter';
import { initConnection } from '../../database/connection';
import {
  initTenantSchema,
  addTenant,
  addTenancy,
  getActiveTenancyForRoom,
  Tenant,
  Tenancy,
} from './TenantModel';

export function useTenantController(roomId: string, onSuccess: () => void) {
  const [dbReady, setDbReady] = useState(false);
  const [activeTenancy, setActiveTenancy] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState<'citizenship' | 'license' | 'passport'>('citizenship');
  const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);
  const [deposit, setDeposit] = useState('');

  // Nepali Calendar (Bikram Sambat) Onboarding Fields
  // Default to today's B.S. date
  const [bsYear, setBsYear] = useState('');
  const [bsMonth, setBsMonth] = useState('');
  const [bsDay, setBsDay] = useState('');

  useEffect(() => {
    async function setup() {
      try {
        await initConnection();
        await initTenantSchema();
        setDbReady(true);
        
        // Load active tenancy if any
        const tenancy = await getActiveTenancyForRoom(roomId);
        if (tenancy) {
          setActiveTenancy(tenancy);
        } else {
          // Initialize B.S. dates for fresh onboarding
          const todayBS = new NepaliDate(new Date());
          setBsYear(todayBS.getYear().toString());
          setBsMonth((todayBS.getMonth() + 1).toString()); // 1-indexed for display
          setBsDay(todayBS.getDate().toString());
        }
      } catch (error) {
        console.error('Tenant feature initialization failed:', error);
      }
    }
    setup();
  }, [roomId]);

  // Request camera and library permissions
  const requestPermissions = async (): Promise<boolean> => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!cameraPermission.granted || !libraryPermission.granted) {
      Alert.alert(
        'Permissions Needed',
        'Camera and photo library access is required to capture IDs.'
      );
      return false;
    }
    return true;
  };

  // Launch camera to click photo
  const handleTakePhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIdPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to take photo:', error);
      Alert.alert('Error', 'Failed to launch camera.');
    }
  };

  // Select photo from library
  const handlePickPhoto = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setIdPhotoUri(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Failed to pick image:', error);
      Alert.alert('Error', 'Failed to open photo gallery.');
    }
  };

  // Onboarding action
  const handleOnboardTenant = async () => {
    if (!name.trim() || !phone.trim() || !bsYear.trim() || !bsMonth.trim() || !bsDay.trim()) {
      Alert.alert('Validation Error', 'Please fill in all mandatory fields.');
      return;
    }

    const depositVal = deposit.trim() ? parseFloat(deposit.trim()) : 0;
    if (isNaN(depositVal) || depositVal < 0) {
      Alert.alert('Validation Error', 'Please enter a valid deposit amount.');
      return;
    }

    // Parse Bikram Sambat date to Gregorian A.D. Date
    let parsedADDate: Date;
    try {
      const year = parseInt(bsYear);
      const month = parseInt(bsMonth);
      const day = parseInt(bsDay);

      if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1 || day > 32) {
        throw new Error('Invalid B.S. Date inputs');
      }

      // nepali-date-converter month is 0-indexed internally
      const nepaliDate = new NepaliDate(year, month - 1, day);
      parsedADDate = nepaliDate.toJsDate();
    } catch (error) {
      Alert.alert('Validation Error', 'Please enter a valid Bikram Sambat (B.S.) date.');
      return;
    }

    const tenantId = Math.random().toString(36).substring(2, 15);
    const newTenant: Tenant = {
      id: tenantId,
      name: name.trim(),
      phone_number: phone.trim(),
      government_id_url: idPhotoUri,
      government_id_type: idType,
      rating: 5.0,
      created_at: new Date().toISOString(),
    };

    const tenancyId = Math.random().toString(36).substring(2, 15);
    const newTenancy: Tenancy = {
      id: tenancyId,
      room_id: roomId,
      tenant_id: tenantId,
      start_date: parsedADDate.toISOString(),
      end_date: null,
      security_deposit_amount: depositVal,
      security_deposit_status: 'held',
      is_active: 1,
      created_at: new Date().toISOString(),
    };

    try {
      await addTenant(newTenant);
      await addTenancy(newTenancy);
      Alert.alert('Success', 'Tenant onboarded successfully.');
      onSuccess();
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      if (error.message && error.message.includes('UNIQUE constraint failed')) {
        Alert.alert('Duplicate Phone Number', 'A tenant with this phone number already exists.');
      } else {
        Alert.alert('Error', 'Failed to onboard tenant.');
      }
    }
  };

  return {
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
  };
}
