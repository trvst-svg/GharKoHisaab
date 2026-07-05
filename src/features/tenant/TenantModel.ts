import { getDB, getDrizzleDB } from '../../database/connection';
import { tenants, tenancies, rooms } from '../../database/schema';
import { eq, and } from 'drizzle-orm';

export interface Tenant {
  id: string;
  name: string;
  phone_number: string;
  government_id_url: string | null;
  government_id_type: 'citizenship' | 'license' | 'passport';
  rating: number;
  created_at: string;
}

export interface Tenancy {
  id: string;
  room_id: string;
  tenant_id: string;
  start_date: string; // Stored in A.D. ISO format
  end_date: string | null;
  security_deposit_amount: number;
  security_deposit_status: 'held' | 'refunded' | 'applied_to_dues';
  is_active: number; // 1 = true, 0 = false
  created_at: string;
}

// SQL Schema definitions to bootstrap this feature's database tables
export async function initTenantSchema(): Promise<void> {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      phone_number TEXT UNIQUE NOT NULL,
      government_id_url TEXT,
      government_id_type TEXT NOT NULL, -- 'citizenship' | 'license' | 'passport'
      rating REAL DEFAULT 5.0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tenancies (
      id TEXT PRIMARY KEY NOT NULL,
      room_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT,
      security_deposit_amount REAL DEFAULT 0,
      security_deposit_status TEXT DEFAULT 'held', -- 'held' | 'refunded' | 'applied_to_dues'
      is_active INTEGER DEFAULT 1, -- 0 for inactive, 1 for active
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );
  `);
}

// Model Queries
export async function addTenant(tenant: Tenant): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(tenants).values({
    id: tenant.id,
    name: tenant.name,
    phoneNumber: tenant.phone_number,
    governmentIdUrl: tenant.government_id_url,
    governmentIdType: tenant.government_id_type,
    rating: tenant.rating,
    createdAt: tenant.created_at,
  });
}

export async function addTenancy(tenancy: Tenancy): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(tenancies).values({
    id: tenancy.id,
    roomId: tenancy.room_id,
    tenantId: tenancy.tenant_id,
    startDate: tenancy.start_date,
    endDate: tenancy.end_date,
    securityDepositAmount: tenancy.security_deposit_amount,
    securityDepositStatus: tenancy.security_deposit_status,
    isActive: tenancy.is_active,
    createdAt: tenancy.created_at,
  });
  
  // Set room status as occupied
  await db.update(rooms).set({ status: 'occupied' }).where(eq(rooms.id, tenancy.room_id));
}

export async function getActiveTenancyForRoom(roomId: string): Promise<(Tenancy & { tenant_name: string; tenant_phone: string; tenant_id_url: string | null; tenant_id_type: string; base_rent: number }) | null> {
  const db = await getDrizzleDB();
  const results = await db.select({
    t: tenancies,
    tn: tenants,
    r: rooms
  })
  .from(tenancies)
  .innerJoin(tenants, eq(tenancies.tenantId, tenants.id))
  .innerJoin(rooms, eq(tenancies.roomId, rooms.id))
  .where(and(eq(tenancies.roomId, roomId), eq(tenancies.isActive, 1)))
  .limit(1);

  if (results.length === 0) return null;
  const result = results[0];

  return {
    id: result.t.id,
    room_id: result.t.roomId,
    tenant_id: result.t.tenantId,
    start_date: result.t.startDate,
    end_date: result.t.endDate,
    security_deposit_amount: result.t.securityDepositAmount || 0,
    security_deposit_status: result.t.securityDepositStatus as any,
    is_active: result.t.isActive || 0,
    created_at: result.t.createdAt || '',
    tenant_name: result.tn.name,
    tenant_phone: result.tn.phoneNumber,
    tenant_id_url: result.tn.governmentIdUrl,
    tenant_id_type: result.tn.governmentIdType,
    base_rent: result.r.baseRent,
  };
}
