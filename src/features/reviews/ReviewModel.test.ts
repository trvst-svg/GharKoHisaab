import { Platform } from 'react-native';

// Set up localStorage Mock BEFORE importing database connection
const store: Record<string, string> = {};
(globalThis as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
  length: 0,
  key: (index: number) => null,
};

Platform.OS = 'web';

import { initConnection, getDrizzleDB } from '../../database/connection';
import { initTenantSchema, addTenant, addTenancy } from '../tenant/TenantModel';
import { initReviewSchema, addTenantReview, addPropertyReview, getReviewsForTenant, getReviewsForProperty } from './ReviewModel';
import { houses, rooms, tenants } from '../../database/schema';
import { eq } from 'drizzle-orm';

describe('Review system tests', () => {
  const houseId = 'house-123';
  const roomId = 'room-101';
  const tenantId = 'tenant-456';
  const tenancyId = 'tenancy-789';

  beforeAll(async () => {
    localStorage.clear();
    await initConnection();
    await initTenantSchema();
    await initReviewSchema();

    // Setup base house, room, and tenant
    const db = await getDrizzleDB();
    await db.insert(houses).values({
      id: houseId,
      housekeeperName: 'Ram',
      name: 'Ram Niwas',
      address: 'Kathmandu',
    });

    await db.insert(rooms).values({
      id: roomId,
      houseId,
      roomNumber: '101',
      baseRent: 12000,
      status: 'vacant',
    });

    await addTenant({
      id: tenantId,
      name: 'Hari Bahadur',
      phone_number: '9841234567',
      government_id_type: 'citizenship',
      government_id_url: null,
      rating: 5.0,
      created_at: new Date().toISOString(),
    });

    await addTenancy({
      id: tenancyId,
      room_id: roomId,
      tenant_id: tenantId,
      start_date: '2026-07-06T00:00:00.000Z',
      end_date: null,
      security_deposit_amount: 12000,
      security_deposit_status: 'held',
      is_active: 1,
      created_at: new Date().toISOString(),
    });
  });

  it('saves tenant reviews and updates average rating', async () => {
    // 1. Initial rating should be 5.0
    const db = await getDrizzleDB();
    let tenantRow = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    expect(tenantRow[0].rating).toBe(5.0);

    // 2. Submit a review with rating 4
    await addTenantReview({
      id: 'rev-1',
      tenancyId,
      tenantId,
      rating: 4.0,
      comments: 'Good payment schedule, but left room a bit messy.',
    });

    // Rating should recalculate to 4.0
    tenantRow = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    expect(tenantRow[0].rating).toBe(4.0);

    // 3. Submit a second review with rating 3
    await addTenantReview({
      id: 'rev-2',
      tenancyId,
      tenantId,
      rating: 3.0,
      comments: 'Disputed over final electricity meter values.',
    });

    // Average should be (4 + 3) / 2 = 3.5
    tenantRow = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
    expect(tenantRow[0].rating).toBe(3.5);

    // 4. Retrieve tenant reviews list
    const list = await getReviewsForTenant(tenantId);
    expect(list.length).toBe(2);
    expect(list[0].comments).toBe('Good payment schedule, but left room a bit messy.');
  });

  it('saves property reviews and retrieves them', async () => {
    await addPropertyReview({
      id: 'prop-rev-1',
      tenancyId,
      houseId,
      rating: 5.0,
      comments: 'Excellent water supply and very helpful owner Ram.',
    });

    const list = await getReviewsForProperty(houseId);
    expect(list.length).toBe(1);
    expect(list[0].rating).toBe(5.0);
    expect(list[0].comments).toBe('Excellent water supply and very helpful owner Ram.');
  });
});
