import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import NepaliDate from 'nepali-date-converter';
import * as Crypto from 'expo-crypto';
import { z } from 'zod';
import { initConnection, getDrizzleDB } from '../../database/connection';
import { rooms } from '../../database/schema';
import { eq } from 'drizzle-orm';
import {
  initTenantSchema,
  addTenant,
  addTenancy,
  getActiveTenancyForRoom,
  Tenant,
  Tenancy,
} from './TenantModel';
import { initAgreementSchema, getAgreementForTenancy } from '../agreement/AgreementModel';

export function useTenantController(roomId: string, onSuccess: () => void) {
  const [dbReady, setDbReady] = useState(false);
  const [activeTenancy, setActiveTenancy] = useState<any | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [idType, setIdType] = useState<'citizenship' | 'license' | 'passport'>('citizenship');
  const [idPhotoUri, setIdPhotoUri] = useState<string | null>(null);
  const [deposit, setDeposit] = useState('');

  // Agreement modal state
  const [lastOnboardedTenancyId, setLastOnboardedTenancyId] = useState<string | null>(null);
  const [lastOnboardedBsDate, setLastOnboardedBsDate] = useState<string>('');
  const [existingAgreement, setExistingAgreement] = useState<any | null>(null);
  const [lastOnboardedDeposit, setLastOnboardedDeposit] = useState<number>(0);
  const [roomBaseRent, setRoomBaseRent] = useState<number>(0);

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
        await initAgreementSchema();
        setDbReady(true);

        // Fetch room base rent for the agreement modal
        try {
          const drizzle = await getDrizzleDB();
          const roomRows = await drizzle.select().from(rooms).where(eq(rooms.id, roomId)).limit(1);
          if (roomRows.length > 0) {
            setRoomBaseRent(roomRows[0].baseRent);
          }
        } catch (e) {
          // Non-critical — base rent will default to 0
        }
        
        // Load active tenancy if any
        const tenancy = await getActiveTenancyForRoom(roomId);
        if (tenancy) {
          setActiveTenancy(tenancy);
          // Load existing agreement for view button
          try {
            const agreement = await getAgreementForTenancy(tenancy.id);
            setExistingAgreement(agreement);
          } catch (e) {
            // Agreement may not exist yet — that's fine
          }
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

  const tenantSchema = z.object({
    name: z.string().trim().min(1, 'Name is required.'),
    phone: z.string().trim().min(1, 'Phone number is required.'),
    deposit: z.string().trim().optional().transform(val => val ? parseFloat(val) : 0).refine(val => !isNaN(val) && val >= 0, 'Please enter a valid deposit amount.'),
    bsYear: z.string().trim().min(1, 'Year is required.').transform(val => parseInt(val)).refine(val => !isNaN(val), 'Invalid year.'),
    bsMonth: z.string().trim().min(1, 'Month is required.').transform(val => parseInt(val)).refine(val => !isNaN(val) && val >= 1 && val <= 12, 'Invalid month.'),
    bsDay: z.string().trim().min(1, 'Day is required.').transform(val => parseInt(val)).refine(val => !isNaN(val) && val >= 1 && val <= 32, 'Invalid day.')
  });

  // Onboarding action
  const handleOnboardTenant = async () => {
    const result = tenantSchema.safeParse({ name, phone, deposit, bsYear, bsMonth, bsDay });
    if (!result.success) {
      Alert.alert('Validation Error', result.error.issues[0].message);
      return;
    }

    const { deposit: depositVal, bsYear: year, bsMonth: month, bsDay: day } = result.data;

    // Parse Bikram Sambat date to Gregorian A.D. Date
    let parsedADDate: Date;
    try {
      // nepali-date-converter month is 0-indexed internally
      const nepaliDate = new NepaliDate(year, month - 1, day);
      parsedADDate = nepaliDate.toJsDate();
    } catch (error) {
      Alert.alert('Validation Error', 'Please enter a valid Bikram Sambat (B.S.) date.');
      return;
    }

    const tenantId = Crypto.randomUUID();
    const newTenant: Tenant = {
      id: tenantId,
      name: name.trim(),
      phone_number: phone.trim(),
      government_id_url: idPhotoUri,
      government_id_type: idType,
      rating: 5.0,
      created_at: new Date().toISOString(),
    };

    const tenancyId = Crypto.randomUUID();
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

      // Format B.S. date string for the agreement modal
      const nepaliDateFormatted = new NepaliDate(
        parseInt(bsYear), parseInt(bsMonth) - 1, parseInt(bsDay)
      ).format('YYYY MMMM DD');

      // Set state so the UI can open the agreement modal
      setLastOnboardedTenancyId(tenancyId);
      setLastOnboardedBsDate(nepaliDateFormatted);
      setLastOnboardedDeposit(depositVal);
      // Don't call onSuccess() yet — let the agreement modal handle the completion
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
    existingAgreement,
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
    // Agreement flow
    lastOnboardedTenancyId,
    setLastOnboardedTenancyId,
    lastOnboardedBsDate,
    lastOnboardedDeposit,
    roomBaseRent,
  };
}
