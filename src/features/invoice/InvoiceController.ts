import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import NepaliDate from 'nepali-date-converter';
import * as Crypto from 'expo-crypto';
import { z } from 'zod';
import { initConnection } from '../../database/connection';
import {
  initInvoiceSchema,
  getInvoicesForTenancy,
  getLastMeterReading,
  addMeterReading,
  addInvoice,
  calculateArrearsForTenancy,
  Invoice,
  MeterReading,
} from './InvoiceModel';

export function useInvoiceController(tenancyId: string, baseRent: number, tenancyStartDate: string) {
  const [dbReady, setDbReady] = useState(false);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [lastReading, setLastReading] = useState<MeterReading | null>(null);
  const [arrears, setArrears] = useState(0);

  // Form Fields for Invoice Modal
  const [isGenerating, setIsGenerating] = useState(false);
  const [currElectricity, setCurrElectricity] = useState('');
  const [electricityRate, setElectricityRate] = useState('12'); // Default Rs. 12 per unit
  const [waterFee, setWaterFee] = useState('500'); // Default Rs. 500 flat
  const [wasteFee, setWasteFee] = useState('150'); // Default Rs. 150 flat

  // Determine current B.S. month name for billing
  const todayBS = new NepaliDate(new Date());
  const currentPeriod = `${todayBS.getYear()} ${todayBS.format('MMMM')}`;

  // Initialize DB and fetch records
  useEffect(() => {
    async function setup() {
      try {
        await initConnection();
        await initInvoiceSchema();
        setDbReady(true);
        await refreshRecords();
      } catch (error) {
        console.error('Invoice feature initialization failed:', error);
      }
    }
    setup();
  }, [tenancyId]);

  const refreshRecords = async () => {
    try {
      const allInvoices = await getInvoicesForTenancy(tenancyId);
      setInvoices(allInvoices);
      
      const reading = await getLastMeterReading(tenancyId);
      setLastReading(reading);

      const pastArrears = await calculateArrearsForTenancy(tenancyId);
      setArrears(pastArrears);
    } catch (error) {
      console.error('Failed to load invoice records:', error);
    }
  };

  // Determine if there is a pending invoice for the current B.S. billing period
  const isCurrentPeriodPending = (): boolean => {
    // Check if an invoice for the current period already exists
    return !invoices.some(inv => inv.billing_period === currentPeriod);
  };

  // Live total calculation helper
  const calculateLiveTotal = (): number => {
    const electricityUnits = getElectricityUnits();
    const elecCost = electricityUnits > 0 ? electricityUnits * parseFloat(electricityRate || '0') : 0;
    const water = parseFloat(waterFee || '0');
    const waste = parseFloat(wasteFee || '0');
    return baseRent + elecCost + water + waste + arrears;
  };

  const getElectricityUnits = (): number => {
    const prev = lastReading ? lastReading.electricity_reading : 0;
    const curr = parseFloat(currElectricity || '0');
    return curr > prev ? curr - prev : 0;
  };

  const invoiceSchema = z.object({
    currRead: z.string().trim().min(1, 'Current meter reading is required.').transform(val => parseFloat(val)).refine(val => !isNaN(val), 'Invalid meter reading.'),
    rate: z.string().trim().min(1, 'Electricity rate is required.').transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, 'Invalid electricity rate.'),
    water: z.string().trim().min(1, 'Water fee is required.').transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, 'Invalid water fee.'),
    waste: z.string().trim().min(1, 'Waste fee is required.').transform(val => parseFloat(val)).refine(val => !isNaN(val) && val >= 0, 'Invalid waste fee.'),
  });

  // Generate the monthly invoice
  const handleGenerateInvoice = async (onSuccess: () => void) => {
    const result = invoiceSchema.safeParse({
      currRead: currElectricity,
      rate: electricityRate,
      water: waterFee,
      waste: wasteFee
    });

    if (!result.success) {
      Alert.alert('Validation Error', result.error.issues[0].message);
      return;
    }

    const { currRead, rate, water, waste } = result.data;
    const prevRead = lastReading ? lastReading.electricity_reading : 0;

    if (currRead < prevRead) {
      Alert.alert(
        'Validation Error',
        `Current meter reading must be greater than or equal to the previous reading (${prevRead} units).`
      );
      return;
    }

    setIsGenerating(true);

    try {
      // 1. Save new meter reading
      const readingId = Crypto.randomUUID();
      const newReading: MeterReading = {
        id: readingId,
        tenancy_id: tenancyId,
        reading_date: new Date().toISOString(),
        electricity_reading: currRead,
        water_reading: 0, // Keeping water simple/flat for now
        created_at: new Date().toISOString(),
      };
      await addMeterReading(newReading);

      // 2. Calculate utility dues
      const elecDue = (currRead - prevRead) * rate;

      // 3. Create invoice
      const invoiceId = Crypto.randomUUID();
      const newInvoice: Invoice = {
        id: invoiceId,
        tenancy_id: tenancyId,
        billing_period: currentPeriod,
        rent_due: baseRent,
        electricity_due: elecDue,
        water_due: water,
        waste_due: waste,
        arrears_carried_forward: arrears,
        total_due: baseRent + elecDue + water + waste + arrears,
        status: 'unpaid',
        created_at: new Date().toISOString(),
      };
      await addInvoice(newInvoice);

      Alert.alert('Success', `Invoice generated successfully for ${currentPeriod}.`);
      
      // Reset form input
      setCurrElectricity('');
      
      // Reload invoices lists
      await refreshRecords();
      onSuccess();
    } catch (error) {
      console.error('Invoice generation failed:', error);
      Alert.alert('Error', 'Failed to generate invoice.');
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    dbReady,
    invoices,
    lastReading,
    arrears,
    isGenerating,
    currElectricity,
    electricityRate,
    waterFee,
    wasteFee,
    currentPeriod,
    setCurrElectricity,
    setElectricityRate,
    setWaterFee,
    setWasteFee,
    isCurrentPeriodPending,
    calculateLiveTotal,
    getElectricityUnits,
    handleGenerateInvoice,
    refreshRecords,
  };
}
