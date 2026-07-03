import { getDB } from '../../database/connection';

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
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO tenants (id, name, phone_number, government_id_url, government_id_type, rating, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?);`,
    [
      tenant.id,
      tenant.name,
      tenant.phone_number,
      tenant.government_id_url,
      tenant.government_id_type,
      tenant.rating,
      tenant.created_at,
    ]
  );
}

export async function addTenancy(tenancy: Tenancy): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO tenancies (id, room_id, tenant_id, start_date, end_date, security_deposit_amount, security_deposit_status, is_active, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      tenancy.id,
      tenancy.room_id,
      tenancy.tenant_id,
      tenancy.start_date,
      tenancy.end_date,
      tenancy.security_deposit_amount,
      tenancy.security_deposit_status,
      tenancy.is_active,
      tenancy.created_at,
    ]
  );
  
  // Set room status as occupied
  await db.runAsync('UPDATE rooms SET status = ? WHERE id = ?;', ['occupied', tenancy.room_id]);
}

export async function getActiveTenancyForRoom(roomId: string): Promise<(Tenancy & { tenant_name: string; tenant_phone: string; tenant_id_url: string | null; tenant_id_type: string }) | null> {
  const db = await getDB();
  const result = await db.getFirstAsync<any>(
    `SELECT t.*, tn.name as tenant_name, tn.phone_number as tenant_phone, tn.government_id_url as tenant_id_url, tn.government_id_type as tenant_id_type
     FROM tenancies t
     JOIN tenants tn ON t.tenant_id = tn.id
     WHERE t.room_id = ? AND t.is_active = 1 LIMIT 1;`,
    [roomId]
  );
  return result || null;
}
