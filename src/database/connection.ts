import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

<<<<<<< Updated upstream
let dbInstance: SQLite.SQLiteDatabase | null = null;
let drizzleInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;
=======
let dbInstance: any = null;

// Helper to load table from localStorage on Web
const getTable = (name: string): any[] => {
  if (Platform.OS !== 'web') return [];
  const val = localStorage.getItem(`db_${name}`);
  return val ? JSON.parse(val) : [];
};

// Helper to save table to localStorage on Web
const saveTable = (name: string, data: any[]) => {
  if (Platform.OS !== 'web') return;
  localStorage.setItem(`db_${name}`, JSON.stringify(data));
};

// Web Mock SQLite Database
class WebSqliteDb {
  async execAsync(sql: string): Promise<void> {
    console.log('[Web DB] execAsync SQL:', sql);
  }

  async runAsync(sql: string, params: any[] = []): Promise<any> {
    console.log('[Web DB] runAsync SQL:', sql, 'params:', params);
    
    if (sql.includes('INSERT INTO houses')) {
      const houses = getTable('houses');
      houses.push({
        id: params[0],
        housekeeper_name: params[1],
        name: params[2],
        address: params[3],
        created_at: params[4] || new Date().toISOString(),
      });
      saveTable('houses', houses);
      return { changes: 1, lastInsertRowId: 1 };
    }
    
    if (sql.includes('INSERT INTO rooms')) {
      const rooms = getTable('rooms');
      rooms.push({
        id: params[0],
        house_id: params[1],
        room_number: params[2],
        base_rent: params[3],
        status: params[4],
        created_at: params[5] || new Date().toISOString(),
      });
      saveTable('rooms', rooms);
      return { changes: 1, lastInsertRowId: 1 };
    }
    
    if (sql.includes('UPDATE rooms SET status = ? WHERE id = ?')) {
      const rooms = getTable('rooms');
      const idx = rooms.findIndex(r => r.id === params[1]);
      if (idx !== -1) {
        rooms[idx].status = params[0];
        saveTable('rooms', rooms);
      }
      return { changes: 1 };
    }
    
    if (sql.includes('DELETE FROM rooms WHERE id = ?')) {
      let rooms = getTable('rooms');
      rooms = rooms.filter(r => r.id !== params[0]);
      saveTable('rooms', rooms);
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO tenants')) {
      const tenants = getTable('tenants');
      tenants.push({
        id: params[0],
        name: params[1],
        phone_number: params[2],
        government_id_url: params[3],
        government_id_type: params[4],
        rating: params[5],
        created_at: params[6] || new Date().toISOString(),
      });
      saveTable('tenants', tenants);
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO tenancies')) {
      const tenancies = getTable('tenancies');
      tenancies.push({
        id: params[0],
        room_id: params[1],
        tenant_id: params[2],
        start_date: params[3],
        end_date: params[4],
        security_deposit_amount: params[5],
        security_deposit_status: params[6],
        is_active: params[7],
        created_at: params[8] || new Date().toISOString(),
      });
      saveTable('tenancies', tenancies);
      
      // Auto update room status to occupied on web
      const rooms = getTable('rooms');
      const rIdx = rooms.findIndex(r => r.id === params[1]);
      if (rIdx !== -1) {
        rooms[rIdx].status = 'occupied';
        saveTable('rooms', rooms);
      }
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO meter_readings')) {
      const readings = getTable('meter_readings');
      readings.push({
        id: params[0],
        tenancy_id: params[1],
        reading_date: params[2],
        electricity_reading: params[3],
        water_reading: params[4],
        created_at: params[5] || new Date().toISOString(),
      });
      saveTable('meter_readings', readings);
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO invoices')) {
      const invoices = getTable('invoices');
      invoices.push({
        id: params[0],
        tenancy_id: params[1],
        billing_period: params[2],
        rent_due: params[3],
        electricity_due: params[4],
        water_due: params[5],
        waste_due: params[6],
        arrears_carried_forward: params[7],
        total_due: params[8],
        status: params[9],
        created_at: params[10] || new Date().toISOString(),
      });
      saveTable('invoices', invoices);
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO payments')) {
      const payments = getTable('payments');
      payments.push({
        id: params[0],
        invoice_id: params[1],
        amount_paid: params[2],
        payment_method: params[3],
        payment_date: params[4],
        receipt_image_url: params[5],
        is_confirmed: params[6],
        otp_code: params[7],
        signature_data: params[8],
        created_at: params[9] || new Date().toISOString(),
      });
      saveTable('payments', payments);
      return { changes: 1 };
    }
    
    if (sql.includes('UPDATE invoices SET status = ? WHERE id = ?')) {
      const invoices = getTable('invoices');
      const idx = invoices.findIndex(inv => inv.id === params[1]);
      if (idx !== -1) {
        invoices[idx].status = params[0];
        saveTable('invoices', invoices);
      }
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO checkout_settlements')) {
      const settlements = getTable('checkout_settlements');
      settlements.push({
        id: params[0],
        tenancy_id: params[1],
        checkout_date: params[2],
        final_rent_due: params[3],
        final_utility_due: params[4],
        damage_charges: params[5],
        deducted_deposit: params[6],
        refunded_deposit: params[7],
        net_balance: params[8],
        is_settled: params[9],
        created_at: params[10] || new Date().toISOString(),
      });
      saveTable('checkout_settlements', settlements);
      return { changes: 1 };
    }
    
    if (sql.includes('UPDATE tenancies SET is_active = 0')) {
      const tenancies = getTable('tenancies');
      const idx = tenancies.findIndex(t => t.id === params[2]);
      if (idx !== -1) {
        tenancies[idx].is_active = 0;
        tenancies[idx].end_date = params[0];
        tenancies[idx].security_deposit_status = params[1];
        saveTable('tenancies', tenancies);
      }
      return { changes: 1 };
    }
    
    if (sql.includes('INSERT INTO room_postings')) {
      const postings = getTable('room_postings');
      const filtered = postings.filter(p => p.room_id !== params[1]);
      filtered.push({
        id: params[0],
        room_id: params[1],
        house_id: params[2],
        title: params[3],
        description: params[4],
        contact_phone: params[5],
        is_active: params[6],
        created_at: params[7] || new Date().toISOString(),
      });
      saveTable('room_postings', filtered);
      return { changes: 1 };
    }
    
    if (sql.includes('UPDATE room_postings SET title = ?')) {
      const postings = getTable('room_postings');
      const idx = postings.findIndex(p => p.id === params[3]);
      if (idx !== -1) {
        postings[idx].title = params[0];
        postings[idx].description = params[1];
        postings[idx].contact_phone = params[2];
        saveTable('room_postings', postings);
      }
      return { changes: 1 };
    }
    
    if (sql.includes('DELETE FROM room_postings WHERE id = ?')) {
      let postings = getTable('room_postings');
      postings = postings.filter(p => p.id !== params[0]);
      saveTable('room_postings', postings);
      return { changes: 1 };
    }
    
    return { changes: 0 };
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    console.log('[Web DB] getAllAsync SQL:', sql, 'params:', params);
    
    if (sql.includes('SELECT * FROM houses')) {
      return getTable('houses') as T[];
    }
    
    if (sql.includes('SELECT * FROM rooms WHERE house_id = ?')) {
      const rooms = getTable('rooms');
      const filtered = rooms.filter(r => r.house_id === params[0]);
      filtered.sort((a, b) => a.room_number.localeCompare(b.room_number, undefined, { numeric: true }));
      return filtered as T[];
    }
    
    if (sql.includes('SELECT * FROM invoices WHERE tenancy_id = ?')) {
      const invoices = getTable('invoices');
      const filtered = invoices.filter(inv => inv.tenancy_id === params[0]);
      filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return filtered as T[];
    }
    
    if (sql.includes('SELECT * FROM payments WHERE invoice_id = ?')) {
      const payments = getTable('payments');
      const filtered = payments.filter(p => p.invoice_id === params[0]);
      filtered.sort((a, b) => b.payment_date.localeCompare(a.payment_date));
      return filtered as T[];
    }
    
    if (sql.includes('SELECT rp.*, r.room_number, r.base_rent, h.name as house_name')) {
      const postings = getTable('room_postings');
      const rooms = getTable('rooms');
      const houses = getTable('houses');
      
      const result = postings
        .filter(rp => rp.is_active === 1)
        .map(rp => {
          const room = rooms.find(r => r.id === rp.room_id);
          const house = houses.find(h => h.id === rp.house_id);
          if (room && house && room.status === 'vacant') {
            return {
              ...rp,
              room_number: room.room_number,
              base_rent: room.base_rent,
              house_name: house.name,
              house_address: house.address,
              housekeeper_name: house.housekeeper_name,
            };
          }
          return null;
        })
        .filter(item => item !== null);
      
      result.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return result as T[];
    }
    
    return [];
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    console.log('[Web DB] getFirstAsync SQL:', sql, 'params:', params);
    
    if (sql.includes('SELECT t.*, tn.name as tenant_name')) {
      const tenancies = getTable('tenancies');
      const tenants = getTable('tenants');
      const rooms = getTable('rooms');
      
      const tenancy = tenancies.find(t => t.room_id === params[0] && t.is_active === 1);
      if (!tenancy) return null;
      
      const tenant = tenants.find(tn => tn.id === tenancy.tenant_id);
      const room = rooms.find(r => r.id === tenancy.room_id);
      
      return {
        ...tenancy,
        tenant_name: tenant ? tenant.name : 'Unknown',
        tenant_phone: tenant ? tenant.phone_number : '',
        tenant_id_url: tenant ? tenant.government_id_url : null,
        tenant_id_type: tenant ? tenant.government_id_type : 'citizenship',
        base_rent: room ? room.base_rent : 0,
      } as any as T;
    }
    
    if (sql.includes('SELECT * FROM meter_readings WHERE tenancy_id = ?')) {
      const readings = getTable('meter_readings');
      const filtered = readings.filter(r => r.tenancy_id === params[0]);
      if (filtered.length === 0) return null;
      filtered.sort((a, b) => b.created_at.localeCompare(a.created_at));
      return filtered[0] as T;
    }
    
    if (sql.includes('SELECT SUM(total_due) as total FROM invoices WHERE tenancy_id = ?')) {
      const invoices = getTable('invoices');
      const filtered = invoices.filter(inv => inv.tenancy_id === params[0]);
      const total = filtered.reduce((sum, inv) => sum + inv.total_due, 0);
      return { total } as any as T;
    }
    
    if (sql.includes('SELECT SUM(amount_paid) as total FROM payments WHERE invoice_id IN')) {
      const invoices = getTable('invoices');
      const payments = getTable('payments');
      
      const invoiceIds = invoices.filter(inv => inv.tenancy_id === params[0]).map(inv => inv.id);
      const matchedPayments = payments.filter(p => invoiceIds.includes(p.invoice_id));
      const total = matchedPayments.reduce((sum, p) => sum + p.amount_paid, 0);
      return { total } as any as T;
    }
    
    if (sql.includes('SELECT SUM(amount_paid) as total FROM payments WHERE invoice_id = ? AND is_confirmed = 1')) {
      const payments = getTable('payments');
      const filtered = payments.filter(p => p.invoice_id === params[0] && p.is_confirmed === 1);
      const total = filtered.reduce((sum, p) => sum + p.amount_paid, 0);
      return { total } as any as T;
    }
    
    if (sql.includes('SELECT total_due FROM invoices WHERE id = ?')) {
      const invoices = getTable('invoices');
      const invoice = invoices.find(inv => inv.id === params[0]);
      return invoice ? { total_due: invoice.total_due } as any as T : null;
    }
    
    if (sql.includes('SELECT * FROM room_postings WHERE room_id = ?')) {
      const postings = getTable('room_postings');
      const posting = postings.find(p => p.room_id === params[0]);
      return posting ? posting as any as T : null;
    }
    
    if (sql.includes('SELECT * FROM checkout_settlements WHERE tenancy_id = ?')) {
      const settlements = getTable('checkout_settlements');
      const settlement = settlements.find(s => s.tenancy_id === params[0]);
      return settlement ? settlement as any as T : null;
    }
    
    return null;
  }
}
>>>>>>> Stashed changes

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (Platform.OS === 'web') {
    if (!dbInstance) {
      dbInstance = new WebSqliteDb();
    }
    return dbInstance as SQLite.SQLiteDatabase;
  }
  
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('gharkohisaab.db');
  }
  return dbInstance as SQLite.SQLiteDatabase;
}

export async function getDrizzleDB() {
  if (!drizzleInstance) {
    const sqlite = await getDB();
    drizzleInstance = drizzle(sqlite, { schema });
  }
  return drizzleInstance;
}

export async function initConnection(): Promise<void> {
  const db = await getDB();
  if (Platform.OS !== 'web') {
    // Enable foreign key support on native SQLite only
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }
}
