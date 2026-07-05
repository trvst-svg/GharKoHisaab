import { useState, useEffect } from 'react';
import { Alert, Platform } from 'react-native';
import * as Crypto from 'expo-crypto';
import { initConnection } from '../../database/connection';
import {
  initAgreementSchema,
  saveAgreement,
  getAgreementForTenancy,
  Agreement,
} from './AgreementModel';

interface AgreementControllerArgs {
  tenancyId: string;
  baseRent: number;
  securityDeposit: number;
  startDateBs: string; // Already formatted B.S. string e.g. "2083 Ashadh 15"
}

export function useAgreementController({
  tenancyId,
  baseRent,
  securityDeposit,
  startDateBs,
}: AgreementControllerArgs) {
  const [dbReady, setDbReady] = useState(false);
  const [existingAgreement, setExistingAgreement] = useState<Agreement | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Editable contract terms
  const [electricityRate, setElectricityRate] = useState('12');
  const [waterRate, setWaterRate] = useState('50');
  const [wasteRate, setWasteRate] = useState('100');
  const [specialTerms, setSpecialTerms] = useState('');

  // Signature state
  const [housekeeperSignature, setHousekeeperSignature] = useState<string | null>(null);
  const [tenantSignature, setTenantSignature] = useState<string | null>(null);

  // Wizard step tracking
  const [step, setStep] = useState(1);

  useEffect(() => {
    async function init() {
      try {
        await initConnection();
        await initAgreementSchema();
        setDbReady(true);

        // Check if agreement already exists for this tenancy
        const existing = await getAgreementForTenancy(tenancyId);
        if (existing) {
          setExistingAgreement(existing);
          // Pre-fill from existing
          setElectricityRate(existing.electricity_rate.toString());
          setWaterRate(existing.water_rate.toString());
          setWasteRate(existing.waste_rate.toString());
          setSpecialTerms(existing.special_terms || '');
          setHousekeeperSignature(existing.housekeeper_signature);
          setTenantSignature(existing.tenant_signature);
        }
      } catch (error) {
        console.error('Agreement schema init failed:', error);
      }
    }
    init();
  }, [tenancyId]);

  const goNext = () => {
    if (step === 1) {
      // Validate rates are positive numbers
      const elecVal = parseFloat(electricityRate);
      const waterVal = parseFloat(waterRate);
      const wasteVal = parseFloat(wasteRate);

      if (isNaN(elecVal) || elecVal < 0) {
        Alert.alert('Validation', 'Please enter a valid electricity rate.');
        return;
      }
      if (isNaN(waterVal) || waterVal < 0) {
        Alert.alert('Validation', 'Please enter a valid water rate.');
        return;
      }
      if (isNaN(wasteVal) || wasteVal < 0) {
        Alert.alert('Validation', 'Please enter a valid waste management rate.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!housekeeperSignature) {
        Alert.alert('Signature Required', 'Housekeeper must sign the agreement before proceeding.');
        return;
      }
      setStep(3);
    }
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSaveAgreement = async () => {
    if (!tenantSignature) {
      Alert.alert('Signature Required', 'Tenant must sign the agreement to complete.');
      return;
    }

    setIsSaving(true);
    try {
      const agreementId = Crypto.randomUUID();
      const now = new Date().toISOString();

      const agreement: Agreement = {
        id: agreementId,
        tenancy_id: tenancyId,
        base_rent: baseRent,
        security_deposit: securityDeposit,
        start_date_bs: startDateBs,
        electricity_rate: parseFloat(electricityRate) || 12,
        water_rate: parseFloat(waterRate) || 50,
        waste_rate: parseFloat(wasteRate) || 100,
        special_terms: specialTerms.trim() || null,
        housekeeper_signature: housekeeperSignature,
        tenant_signature: tenantSignature,
        signed_at: now,
        device_id: `${Platform.OS}-${Platform.Version}`,
        created_at: now,
      };

      await saveAgreement(agreement);
      setExistingAgreement(agreement);
      Alert.alert('Agreement Signed ✅', 'The tenancy agreement has been digitally signed and saved.');
    } catch (error) {
      console.error('Failed to save agreement:', error);
      Alert.alert('Error', 'Failed to save the agreement. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    dbReady,
    existingAgreement,
    isSaving,
    step,
    goNext,
    goBack,

    // Contract terms
    baseRent,
    securityDeposit,
    startDateBs,
    electricityRate,
    setElectricityRate,
    waterRate,
    setWaterRate,
    wasteRate,
    setWasteRate,
    specialTerms,
    setSpecialTerms,

    // Signatures
    housekeeperSignature,
    setHousekeeperSignature,
    tenantSignature,
    setTenantSignature,

    handleSaveAgreement,
  };
}
