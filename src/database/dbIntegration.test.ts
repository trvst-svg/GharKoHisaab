import { Platform } from 'react-native';

// Set up localStorage Mock BEFORE importing database connection
const store: Record<string, string> = {};
global.localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  length: 0,
  key: (index: number) => null,
};

// Force react-native Platform.OS to web for testing the mock SQLite database engine
Platform.OS = 'web';

import { initConnection } from './connection';
import { initTenantSchema, addTenant, addTenancy, getActiveTenancyForRoom } from '../features/tenant/TenantModel';
import { initAgreementSchema, saveAgreement, getAgreementForTenancy } from '../features/agreement/AgreementModel';
import { initInvoiceSchema, addInvoice, getInvoicesForTenancy, addMeterReading, getLastMeterReading } from '../features/invoice/InvoiceModel';
import { initCheckoutSchema, addCheckoutSettlement, terminateTenancy } from '../features/checkout/CheckoutModel';

describe('Database & Model Integration Tests', () => {
  beforeAll(async () => {
    // Clear storage and initialize all schemas
    localStorage.clear();
    await initConnection();
    await initTenantSchema();
    await initAgreementSchema();
    await initInvoiceSchema();
    await initCheckoutSchema();
  });

  it('completes the full tenancy lifecycle: onboarding -> agreement -> invoicing -> payment -> checkout', async () => {
    // 1. Setup a Room in the local table first
    const roomId = 'room-101';
    const initialRooms = [{ id: roomId, room_number: '101', base_rent: 12000, status: 'vacant' }];
    localStorage.setItem('db_rooms', JSON.stringify(initialRooms));

    // 2. Onboard Tenant
    const tenantId = 'tenant-xyz';
    await addTenant({
      id: tenantId,
      name: 'Ram Kumar Shrestha',
      phone_number: '9841000000',
      government_id_url: null,
      government_id_type: 'citizenship',
      rating: 5.0,
      created_at: new Date().toISOString(),
    });

    const tenancyId = 'tenancy-123';
    await addTenancy({
      id: tenancyId,
      room_id: roomId,
      tenant_id: tenantId,
      start_date: new Date().toISOString(),
      end_date: null,
      security_deposit_amount: 10000,
      security_deposit_status: 'held',
      is_active: 1,
      created_at: new Date().toISOString(),
    });

    // Verify room status was updated to occupied by onboarding side effect
    const rooms = JSON.parse(localStorage.getItem('db_rooms') || '[]');
    expect(rooms[0].status).toBe('occupied');

    // 3. Save Tenancy Agreement
    const agreementId = 'agreement-456';
    await saveAgreement({
      id: agreementId,
      tenancy_id: tenancyId,
      base_rent: 12000,
      security_deposit: 10000,
      start_date_bs: '2083 Ashadh 15',
      electricity_rate: 12,
      water_rate: 50,
      waste_rate: 100,
      special_terms: 'No smoking.',
      housekeeper_signature: 'M 0 0 L 10 10',
      tenant_signature: 'M 0 0 L 20 20',
      signed_at: new Date().toISOString(),
      device_id: 'test-env',
      created_at: new Date().toISOString(),
    });

    const savedAgreement = await getAgreementForTenancy(tenancyId);
    expect(savedAgreement).toBeDefined();
    expect(savedAgreement?.special_terms).toBe('No smoking.');

    // 4. Generate Invoice and Meter Reading
    await addMeterReading({
      id: 'read-1',
      tenancy_id: tenancyId,
      reading_date: new Date().toISOString(),
      electricity_reading: 150,
      water_reading: 0,
      created_at: new Date().toISOString(),
    });

    const lastReading = await getLastMeterReading(tenancyId);
    expect(lastReading?.electricity_reading).toBe(150);

    const invoiceId = 'invoice-789';
    await addInvoice({
      id: invoiceId,
      tenancy_id: tenancyId,
      billing_period: '2083 Ashadh',
      rent_due: 12000,
      electricity_due: 120, // 10 units * 12
      water_due: 50,
      waste_due: 100,
      arrears_carried_forward: 0,
      total_due: 12270,
      status: 'unpaid',
      created_at: new Date().toISOString(),
    });

    const invoices = await getInvoicesForTenancy(tenancyId);
    expect(invoices.length).toBe(1);
    expect(invoices[0].total_due).toBe(12270);

    // 5. Perform Checkout Settlement
    await addCheckoutSettlement({
      id: 'settle-1',
      tenancy_id: tenancyId,
      checkout_date: '2083 Shrawan 15',
      final_rent_due: 6000,
      final_utility_due: 100,
      damage_charges: 500,
      deducted_deposit: 6600,
      refunded_deposit: 3400,
      net_balance: -3400, // landlord owes tenant refund
      is_settled: 1,
      created_at: new Date().toISOString(),
    });

    await terminateTenancy(tenancyId, roomId);

    // Verify tenancy is deactivated
    const activeTenancy = await getActiveTenancyForRoom(roomId);
    expect(activeTenancy).toBeNull();

    // Verify room status goes back to vacant
    const postRooms = JSON.parse(localStorage.getItem('db_rooms') || '[]');
    expect(postRooms[0].status).toBe('vacant');
  });
});
