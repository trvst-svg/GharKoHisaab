import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import NepaliDate from 'nepali-date-converter';
import * as Crypto from 'expo-crypto';
import { z } from 'zod';
import { initConnection, getDrizzleDB } from '../../database/connection';
import { eq } from 'drizzle-orm';
import { tenancies } from '../../database/schema';
import {
  initCheckoutSchema,
  addCheckoutSettlement,
  terminateTenancy,
} from './CheckoutModel';
import {
  calculateArrearsForTenancy,
  getLastMeterReading,
  addMeterReading,
  MeterReading,
} from '../invoice/InvoiceModel';
import { initReviewSchema, addTenantReview } from '../reviews/ReviewModel';

// Utility helper to safely construct a NepaliDate clamped to the target month's maximum day
function getSafeNepaliDate(year: number, month: number, day: number): NepaliDate {
  let d = day;
  let nd = new NepaliDate(year, month, d);
  // Loop back if the constructed date rolls over to a different month
  while (nd.getMonth() !== (month + 12) % 12 && d > 1) {
    d--;
    nd = new NepaliDate(year, month, d);
  }
  return nd;
}

// Utility to find the B.S. billing cycle boundaries containing the checkout date
export function getCycleDates(startDateAD: Date, checkoutDateAD: Date) {
  const startBS = new NepaliDate(startDateAD);
  const checkoutBS = new NepaliDate(checkoutDateAD);

  const targetDay = startBS.getDate();
  const checkoutYear = checkoutBS.getYear();
  const checkoutMonth = checkoutBS.getMonth(); // 0-indexed (0 to 11)
  const checkoutDay = checkoutBS.getDate();

  let cycleStartBS: NepaliDate;
  let cycleEndBS: NepaliDate;

  if (checkoutDay >= targetDay) {
    cycleStartBS = getSafeNepaliDate(checkoutYear, checkoutMonth, targetDay);
    
    let nextYear = checkoutYear;
    let nextMonth = checkoutMonth + 1;
    if (nextMonth > 11) {
      nextMonth = 0;
      nextYear++;
    }
    cycleEndBS = getSafeNepaliDate(nextYear, nextMonth, targetDay);
  } else {
    let prevYear = checkoutYear;
    let prevMonth = checkoutMonth - 1;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear--;
    }
    cycleStartBS = getSafeNepaliDate(prevYear, prevMonth, targetDay);
    cycleEndBS = getSafeNepaliDate(checkoutYear, checkoutMonth, targetDay);
  }

  return {
    cycleStartAD: cycleStartBS.toJsDate(),
    cycleEndAD: cycleEndBS.toJsDate(),
    cycleStartBS,
    cycleEndBS,
  };
}

export function useCheckoutController(
  tenancyId: string,
  roomId: string,
  baseRent: number,
  tenancyStartDate: string,
  securityDeposit: number,
  onSuccess: () => void
) {
  const [dbReady, setDbReady] = useState(false);
  const [arrears, setArrears] = useState(0);
  const [lastReading, setLastReading] = useState<MeterReading | null>(null);
  const [tenantId, setTenantId] = useState('');

  // Rating & Feedback Fields
  const [tenantRating, setTenantRating] = useState(5);
  const [tenantComments, setTenantComments] = useState('');

  // Form Fields
  const [checkoutYear, setCheckoutYear] = useState('');
  const [checkoutMonth, setCheckoutMonth] = useState('');
  const [checkoutDay, setCheckoutDay] = useState('');

  const [finalElectricityReading, setFinalElectricityReading] = useState('');
  const [electricityRate, setElectricityRate] = useState('12'); // Rs. 12/unit
  const [waterFee, setWaterFee] = useState('0');
  const [wasteFee, setWasteFee] = useState('0');
  const [damageFee, setDamageFee] = useState('0');
  
  const [isSettled, setIsSettled] = useState(true); // default to true
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function setup() {
      try {
        await initConnection();
        await initCheckoutSchema();
        await initReviewSchema();

        // Query tenancy to fetch tenantId
        const db = await getDrizzleDB();
        const tenancyRows = await db.select().from(tenancies).where(eq(tenancies.id, tenancyId)).limit(1);
        if (tenancyRows.length > 0) {
          setTenantId(tenancyRows[0].tenantId);
        }
        
        // Load outstanding arrears and previous sub-meter reading
        const pastArrears = await calculateArrearsForTenancy(tenancyId);
        setArrears(pastArrears);

        const prevReading = await getLastMeterReading(tenancyId);
        setLastReading(prevReading);
        if (prevReading) {
          setFinalElectricityReading(prevReading.electricity_reading.toString());
        }

        // Initialize checkout date input to today's date in B.S.
        const todayBS = new NepaliDate(new Date());
        setCheckoutYear(todayBS.getYear().toString());
        setCheckoutMonth((todayBS.getMonth() + 1).toString());
        setCheckoutDay(todayBS.getDate().toString());

        setDbReady(true);
      } catch (error) {
        console.error('Checkout system initialization failed:', error);
      }
    }
    setup();
  }, [tenancyId]);

  const dateSchema = z.object({
    year: z.string().trim().min(1, 'Year is required.').transform(val => parseInt(val)).refine(val => !isNaN(val), 'Invalid year.'),
    month: z.string().trim().min(1, 'Month is required.').transform(val => parseInt(val)).refine(val => !isNaN(val) && val >= 1 && val <= 12, 'Invalid month.'),
    day: z.string().trim().min(1, 'Day is required.').transform(val => parseInt(val)).refine(val => !isNaN(val) && val >= 1 && val <= 32, 'Invalid day.')
  });

  // Derive pro-rated dates, days stayed, and rent calculation
  const getProRatedDetails = () => {
    const dateResult = dateSchema.safeParse({ year: checkoutYear, month: checkoutMonth, day: checkoutDay });
    if (!dateResult.success) {
      return { error: 'Please enter a valid B.S. date' };
    }

    const { year, month, day } = dateResult.data;

    try {
      const checkoutBS = new NepaliDate(year, month - 1, day);
      const checkoutDateAD = checkoutBS.toJsDate();
      const startDateAD = new Date(tenancyStartDate);

      if (checkoutDateAD.getTime() < startDateAD.getTime()) {
        return { error: 'Checkout date cannot be before tenancy start date.' };
      }

      const cycle = getCycleDates(startDateAD, checkoutDateAD);
      
      const totalDays = Math.max(1, Math.round((cycle.cycleEndAD.getTime() - cycle.cycleStartAD.getTime()) / (1000 * 60 * 60 * 24)));
      const daysStayed = Math.max(0, Math.round((checkoutDateAD.getTime() - cycle.cycleStartAD.getTime()) / (1000 * 60 * 60 * 24)));
      
      const clampedDays = Math.min(totalDays, daysStayed);
      const proRatedRent = (clampedDays / totalDays) * baseRent;

      return {
        cycleStartBS: cycle.cycleStartBS.format('YYYY-MM-DD'),
        cycleEndBS: cycle.cycleEndBS.format('YYYY-MM-DD'),
        totalDays,
        daysStayed: clampedDays,
        proRatedRent,
        checkoutDateAD,
      };
    } catch (e) {
      return { error: 'Failed to compute calendar conversion.' };
    }
  };

  const getFinalElectricityCost = (): number => {
    if (!lastReading) return 0;
    const curr = parseFloat(finalElectricityReading || '0');
    const prev = lastReading.electricity_reading;
    const rate = parseFloat(electricityRate || '0');
    if (isNaN(curr) || isNaN(rate) || curr <= prev) return 0;
    return (curr - prev) * rate;
  };

  const getFinalUtilityDue = (): number => {
    const elec = getFinalElectricityCost();
    const water = parseFloat(waterFee || '0');
    const waste = parseFloat(wasteFee || '0');
    return (isNaN(elec) ? 0 : elec) + (isNaN(water) ? 0 : water) + (isNaN(waste) ? 0 : waste);
  };

  const getNetBalanceAndBreakdown = () => {
    const pro = getProRatedDetails();
    if ('error' in pro) {
      return { error: pro.error };
    }

    const proRent = pro.proRatedRent;
    const utilDue = getFinalUtilityDue();
    const damages = parseFloat(damageFee || '0') || 0;

    const totalDues = proRent + utilDue + arrears + damages;
    const depositHeld = securityDeposit;
    const netBalance = totalDues - depositHeld;

    let deductedDeposit = 0;
    let refundedDeposit = 0;

    if (netBalance >= 0) {
      deductedDeposit = depositHeld;
      refundedDeposit = 0;
    } else {
      deductedDeposit = totalDues;
      refundedDeposit = Math.abs(netBalance);
    }

    return {
      proRent,
      utilDue,
      damages,
      totalDues,
      depositHeld,
      netBalance,
      deductedDeposit,
      refundedDeposit,
      checkoutDateAD: pro.checkoutDateAD,
      daysStayed: pro.daysStayed,
      totalDays: pro.totalDays,
    };
  };

  const handleConfirmCheckout = async () => {
    const breakdown = getNetBalanceAndBreakdown();
    if ('error' in breakdown) {
      Alert.alert('Validation Error', breakdown.error);
      return;
    }

    const finalRead = parseFloat(finalElectricityReading);
    const prevRead = lastReading ? lastReading.electricity_reading : 0;
    if (lastReading && (isNaN(finalRead) || finalRead < prevRead)) {
      Alert.alert(
        'Validation Error',
        `Final electricity reading must be greater than or equal to previous reading (${prevRead}).`
      );
      return;
    }

    setIsSaving(true);
    try {
      const settlementId = Crypto.randomUUID();

      // Save Checkout Settlement record
      await addCheckoutSettlement({
        id: settlementId,
        tenancy_id: tenancyId,
        checkout_date: breakdown.checkoutDateAD.toISOString(),
        final_rent_due: breakdown.proRent,
        final_utility_due: breakdown.utilDue,
        damage_charges: breakdown.damages,
        deducted_deposit: breakdown.deductedDeposit,
        refunded_deposit: breakdown.refundedDeposit,
        net_balance: breakdown.netBalance,
        is_settled: isSettled ? 1 : 0,
        created_at: new Date().toISOString(),
      });

      // Update room and tenancy status
      // If we deducted all of the deposit or there's refund, we update deposit status
      const depositStatus = breakdown.deductedDeposit > 0
        ? (breakdown.refundedDeposit > 0 ? 'refunded' : 'applied_to_dues')
        : 'refunded';

      await terminateTenancy(
        tenancyId,
        roomId,
        breakdown.checkoutDateAD.toISOString(),
        depositStatus as any
      );

      // Save tenant review if rating is set
      if (tenantId && tenantRating > 0) {
        await addTenantReview({
          id: Crypto.randomUUID(),
          tenancyId: tenancyId,
          tenantId: tenantId,
          rating: tenantRating,
          comments: tenantComments,
        });
      }

      // Save final reading if updated
      if (!isNaN(finalRead) && lastReading && finalRead > lastReading.electricity_reading) {
        const readingId = Crypto.randomUUID();
        await addMeterReading({
          id: readingId,
          tenancy_id: tenancyId,
          reading_date: breakdown.checkoutDateAD.toISOString(),
          electricity_reading: finalRead,
          water_reading: 0,
          created_at: new Date().toISOString(),
        });
      }

      Alert.alert('Success', 'Tenant checked out successfully. Room is now vacant.');
      onSuccess();
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Error', 'Failed to complete tenant checkout.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    dbReady,
    arrears,
    lastReading,
    checkoutYear,
    checkoutMonth,
    checkoutDay,
    finalElectricityReading,
    electricityRate,
    waterFee,
    wasteFee,
    damageFee,
    isSettled,
    isSaving,
    setCheckoutYear,
    setCheckoutMonth,
    setCheckoutDay,
    setFinalElectricityReading,
    setElectricityRate,
    setWaterFee,
    setWasteFee,
    setDamageFee,
    setIsSettled,
    getProRatedDetails,
    getFinalElectricityCost,
    getFinalUtilityDue,
    getNetBalanceAndBreakdown,
    handleConfirmCheckout,
    tenantRating,
    setTenantRating,
    tenantComments,
    setTenantComments,
  };
}
