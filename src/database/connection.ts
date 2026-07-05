import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

let dbInstance: any = null;
let drizzleInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

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

// Helper to parse INSERT queries dynamically
function parseInsertParams(sql: string, params: any[]) {
  const cleanSql = sql.replace(/["`]/g, '');
  const match = cleanSql.match(/insert\s+into\s+(\w+)\s*\(([^)]+)\)/i);
  if (!match) return null;
  const table = match[1].toLowerCase();
  const cols = match[2].split(',').map(s => s.trim());
  
  const data: any = {};
  cols.forEach((col, idx) => {
    data[col] = params[idx];
  });
  return { table, data };
}

// Helper to parse UPDATE queries dynamically
function parseUpdateParams(sql: string, params: any[]) {
  const cleanSql = sql.replace(/["`]/g, '');
  const match = cleanSql.match(/update\s+(\w+)\s+set\s+([^]+?)\s+where\s+([^]+)/i);
  if (!match) return null;
  const table = match[1].toLowerCase();
  const setPart = match[2];
  const wherePart = match[3];
  
  const setCols: string[] = [];
  const setMatches = setPart.matchAll(/(\w+)\s*=\s*\?/gi);
  for (const m of setMatches) {
    setCols.push(m[1]);
  }
  
  const whereCols: string[] = [];
  const wherePartClean = wherePart.replace(/\w+\./g, '');
  const whereMatches = wherePartClean.matchAll(/(\w+)\s*=\s*\?/gi);
  for (const m of whereMatches) {
    whereCols.push(m[1]);
  }
  
  const setData: any = {};
  setCols.forEach((col, idx) => {
    setData[col] = params[idx];
  });
  
  const whereData: any = {};
  whereCols.forEach((col, idx) => {
    whereData[col] = params[setCols.length + idx];
  });
  
  return { table, setData, whereData };
}

// Helper to parse DELETE queries dynamically
function parseDeleteParams(sql: string, params: any[]) {
  const cleanSql = sql.replace(/["`]/g, '');
  const match = cleanSql.match(/delete\s+from\s+(\w+)\s+where\s+([^]+)/i);
  if (!match) return null;
  const table = match[1].toLowerCase();
  const wherePart = match[2].replace(/\w+\./g, '');
  
  const whereCols: string[] = [];
  const whereMatches = wherePart.matchAll(/(\w+)\s*=\s*\?/gi);
  for (const m of whereMatches) {
    whereCols.push(m[1]);
  }
  
  const whereData: any = {};
  whereCols.forEach((col, idx) => {
    whereData[col] = params[idx];
  });
  
  return { table, whereData };
}

// Helper to parse SELECT queries dynamically
function parseSelectParams(sql: string, params: any[]) {
  const cleanSql = sql.replace(/["`]/g, '');
  
  // Extract table name right after FROM
  const fromMatch = cleanSql.match(/from\s+(\w+)/i);
  if (!fromMatch) return null;
  const table = fromMatch[1].toLowerCase();
  
  // Extract where clause anywhere in the SQL statement
  const whereMatch = cleanSql.match(/where\s+([^]+)/i);
  const wherePart = whereMatch ? whereMatch[1].replace(/\w+\./g, '') : null;
  
  const whereData: any = {};
  if (wherePart) {
    const whereCols: string[] = [];
    const whereMatches = wherePart.matchAll(/(\w+)\s*=\s*\?/gi);
    for (const m of whereMatches) {
      whereCols.push(m[1]);
    }
    whereCols.forEach((col, idx) => {
      whereData[col] = params[idx];
    });
  }
  return { table, whereData };
}

// Helper to extract SELECT columns in order
function parseSelectColumns(sql: string): string[] {
  const cleanSql = sql.replace(/["`]/g, '');
  const match = cleanSql.match(/select\s+([^]+?)\s+from/i);
  if (!match) return [];
  // Split columns and map to clean lowercase names
  return match[1].split(',').map(s => s.trim().toLowerCase());
}

// Web Mock SQLite Statement Result wrapper
class WebSqliteExecuteResult<T> {
  lastInsertRowId: number;
  changes: number;
  rows: T[];

  constructor(rows: T[], changes = 0, lastInsertRowId = 0) {
    this.rows = rows;
    this.changes = changes;
    this.lastInsertRowId = lastInsertRowId;
  }

  async getFirstAsync(): Promise<T | null> {
    return this.rows[0] || null;
  }

  async getAllAsync(): Promise<T[]> {
    return this.rows;
  }

  async resetAsync(): Promise<void> {}

  getFirstSync(): T | null {
    return this.rows[0] || null;
  }

  getAllSync(): T[] {
    return this.rows;
  }

  resetSync(): void {}

  // IterableIterator
  next(): IteratorResult<T> {
    const iterator = this.rows[Symbol.iterator]();
    return iterator.next();
  }

  [Symbol.iterator](): IterableIterator<T> {
    return this.rows[Symbol.iterator]();
  }

  [Symbol.asyncIterator](): AsyncIterableIterator<T> {
    const iterator = this.rows[Symbol.iterator]();
    return {
      async next(): Promise<IteratorResult<T>> {
        return iterator.next();
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
}

// Web Mock SQLite Statement
class WebSqliteStatement {
  db: WebSqliteDb;
  sql: string;

  constructor(db: WebSqliteDb, sql: string) {
    this.db = db;
    this.sql = sql;
  }

  executeSync<T>(params: any[] = []): any {
    const isQuery = this.sql.trim().toLowerCase().startsWith('select');
    if (isQuery) {
      const rows = this.db.getAllSync<T>(this.sql, params);
      return new WebSqliteExecuteResult<T>(rows, 0, 0);
    } else {
      const result = this.db.runSync(this.sql, params);
      return new WebSqliteExecuteResult<T>([], result.changes, result.lastInsertRowId || 0);
    }
  }

  async executeAsync<T>(params: any[] = []): Promise<any> {
    return this.executeSync<T>(params);
  }

  executeForRawResultSync<T>(params: any[] = []): any {
    const isQuery = this.sql.trim().toLowerCase().startsWith('select');
    if (isQuery) {
      const rows = this.db.getAllSync<any>(this.sql, params);
      const cols = parseSelectColumns(this.sql);
      
      // Map row objects to value arrays in the exact order expected by the SELECT statement
      const rawRows = rows.map(item => {
        return cols.map(col => {
          const cleanCol = col.replace(/^\w+\./, '').trim();
          const val = item[cleanCol] !== undefined ? item[cleanCol] : item[toCamelCase(cleanCol)];
          return val === undefined ? null : val;
        });
      });
      
      return new WebSqliteExecuteResult<any>(rawRows, 0, 0);
    } else {
      const result = this.db.runSync(this.sql, params);
      return new WebSqliteExecuteResult<any>([], result.changes, result.lastInsertRowId || 0);
    }
  }

  async executeForRawResultAsync<T>(params: any[] = []): Promise<any> {
    return this.executeForRawResultSync<T>(params);
  }

  getColumnNamesSync(): string[] {
    return parseSelectColumns(this.sql);
  }

  async getColumnNamesAsync(): Promise<string[]> {
    return this.getColumnNamesSync();
  }

  finalizeSync(): void {
    console.log('[Web DB] finalizeSync');
  }

  async finalizeAsync(): Promise<void> {
    this.finalizeSync();
  }
}

// Web Mock SQLite Database
class WebSqliteDb {
  async execAsync(sql: string): Promise<void> {
    console.log('[Web DB] execAsync SQL:', sql);
  }

  async runAsync(sql: string, params: any[] = []): Promise<any> {
    return this.runSync(sql, params);
  }

  runSync(sql: string, params: any[] = []): any {
    console.log('[Web DB] runSync SQL:', sql, 'params:', params);
    
    const parsedInsert = parseInsertParams(sql, params);
    if (parsedInsert) {
      const { table, data } = parsedInsert;
      const list = getTable(table);
      
      // Enforce UNIQUE constraint for room_postings on room_id
      if (table === 'room_postings' || table === 'roomPostings') {
        const filtered = list.filter(p => p.room_id !== data.room_id && p.roomId !== data.roomId);
        filtered.push(data);
        saveTable(table, filtered);
      } else {
        list.push(data);
        saveTable(table, list);
      }
      
      // Side effect: Auto update room status to occupied on web onboarding
      if (table === 'tenancies') {
        const rooms = getTable('rooms');
        const rIdx = rooms.findIndex(r => r.id === (data.room_id || data.roomId));
        if (rIdx !== -1) {
          rooms[rIdx].status = 'occupied';
          saveTable('rooms', rooms);
        }
      }
      return { changes: 1, lastInsertRowId: Math.floor(Math.random() * 1000000) };
    }
    
    const parsedUpdate = parseUpdateParams(sql, params);
    if (parsedUpdate) {
      const { table, setData, whereData } = parsedUpdate;
      const list = getTable(table);
      let changes = 0;
      list.forEach(item => {
        const match = Object.keys(whereData).every(k => {
          return item[k] == whereData[k] || item[toCamelCase(k)] == whereData[k];
        });
        if (match) {
          Object.assign(item, setData);
          changes++;
        }
      });
      if (changes > 0) {
        saveTable(table, list);
      }
      return { changes };
    }
    
    const parsedDelete = parseDeleteParams(sql, params);
    if (parsedDelete) {
      const { table, whereData } = parsedDelete;
      const list = getTable(table);
      const filtered = list.filter(item => {
        return !Object.keys(whereData).every(k => item[k] == whereData[k] || item[toCamelCase(k)] == whereData[k]);
      });
      const changes = list.length - filtered.length;
      saveTable(table, filtered);
      return { changes };
    }
    
    return { changes: 0 };
  }

  async getAllAsync<T>(sql: string, params: any[] = []): Promise<T[]> {
    return this.getAllSync(sql, params);
  }

  getAllSync<T>(sql: string, params: any[] = []): T[] {
    console.log('[Web DB] getAllSync SQL:', sql, 'params:', params);
    const parsed = parseSelectParams(sql, params);
    if (!parsed) return [];
    
    const { table, whereData } = parsed;
    const list = getTable(table);
    
    let result = list.filter(item => {
      return Object.keys(whereData).every(k => item[k] == whereData[k] || item[toCamelCase(k)] == whereData[k]);
    });
    
    // Sort overrides for consistency
    if (table === 'rooms') {
      result.sort((a, b) => (a.room_number || a.roomNumber || '').localeCompare(b.room_number || b.roomNumber || '', undefined, { numeric: true }));
    } else if (table === 'invoices') {
      result.sort((a, b) => (b.created_at || b.createdAt || '').localeCompare(a.created_at || a.createdAt || ''));
    } else if (table === 'payments') {
      result.sort((a, b) => (b.payment_date || b.paymentDate || '').localeCompare(a.payment_date || a.paymentDate || ''));
    } else if (table === 'houses') {
      result.sort((a, b) => (a.created_at || a.createdAt || '').localeCompare(b.created_at || b.createdAt || ''));
    }
    
    // Handle complex JOINs inside active tenancy details
    const cleanSql = sql.replace(/["`]/g, '').toLowerCase();
    if (table === 'tenancies' && cleanSql.includes('join tenants') && cleanSql.includes('join rooms')) {
      const tenanciesList = getTable('tenancies');
      const tenants = getTable('tenants');
      const rooms = getTable('rooms');
      
      const roomId = whereData.room_id || whereData.roomId;
      const isActiveFilter = whereData.is_active !== undefined ? whereData.is_active : whereData.isActive;
      
      const filteredTenancies = tenanciesList.filter(t => 
        (roomId === undefined || t.room_id == roomId || t.roomId == roomId) && 
        (isActiveFilter === undefined || t.is_active == isActiveFilter || t.isActive == isActiveFilter)
      );
      
      const joined = filteredTenancies.map(tenancy => {
        const tenant = tenants.find(tn => tn.id === (tenancy.tenant_id || tenancy.tenantId));
        const room = rooms.find(r => r.id === (tenancy.room_id || tenancy.roomId));
        return mapToDrizzleFormat({
          ...tenancy,
          tenant_name: tenant ? tenant.name : 'Unknown',
          tenant_phone: tenant ? tenant.phoneNumber || tenant.phone_number : '',
          tenant_id_url: tenant ? tenant.governmentIdUrl || tenant.government_id_url : null,
          tenant_id_type: tenant ? tenant.governmentIdType || tenant.government_id_type : 'citizenship',
          base_rent: room ? room.baseRent || room.base_rent : 0,
        });
      });
      return joined as T[];
    }

    // Handle complex JOINs inside public postings feed
    if (cleanSql.includes('join rooms') && cleanSql.includes('join houses')) {
      const postings = getTable('room_postings').length > 0 ? getTable('room_postings') : getTable('roomPostings');
      const rooms = getTable('rooms');
      const houses = getTable('houses');
      
      const joined = postings
        .filter(rp => rp.is_active == 1 || rp.isActive == 1)
        .map(rp => {
          const room = rooms.find(r => r.id === (rp.room_id || rp.roomId));
          const house = houses.find(h => h.id === (rp.house_id || rp.houseId));
          if (room && house && room.status === 'vacant') {
            return {
              ...rp,
              room_number: room.roomNumber || room.room_number,
              base_rent: room.baseRent || room.base_rent,
              house_name: house.name,
              house_address: house.address,
              housekeeper_name: house.housekeeperName || house.housekeeper_name,
            };
          }
          return null;
        })
        .filter(item => item !== null);
      
      joined.sort((a, b) => (b.created_at || b.createdAt || '').localeCompare(a.created_at || a.createdAt || ''));
      return joined as T[];
    }
    
    return result.map(mapToDrizzleFormat) as T[];
  }

  async getFirstAsync<T>(sql: string, params: any[] = []): Promise<T | null> {
    return this.getFirstSync(sql, params);
  }

  getFirstSync<T>(sql: string, params: any[] = []): T | null {
    console.log('[Web DB] getFirstSync SQL:', sql, 'params:', params);
    const parsed = parseSelectParams(sql, params);
    if (!parsed) return null;
    
    const { table, whereData } = parsed;
    const cleanSql = sql.replace(/["`]/g, '').toLowerCase();
    
    // Handle complex JOINs inside active tenancy details
    if (table === 'tenancies' && cleanSql.includes('join tenants') && cleanSql.includes('join rooms')) {
      const tenancies = getTable('tenancies');
      const tenants = getTable('tenants');
      const rooms = getTable('rooms');
      
      const roomId = whereData.room_id || whereData.roomId;
      const tenancy = tenancies.find(t => (t.room_id == roomId || t.roomId == roomId) && (t.is_active == 1 || t.isActive == 1));
      if (!tenancy) return null;
      
      const tenant = tenants.find(tn => tn.id === (tenancy.tenant_id || tenancy.tenantId));
      const room = rooms.find(r => r.id === (tenancy.room_id || tenancy.roomId));
      
      return mapToDrizzleFormat({
        ...tenancy,
        tenant_name: tenant ? tenant.name : 'Unknown',
        tenant_phone: tenant ? tenant.phoneNumber || tenant.phone_number : '',
        tenant_id_url: tenant ? tenant.governmentIdUrl || tenant.government_id_url : null,
        tenant_id_type: tenant ? tenant.governmentIdType || tenant.government_id_type : 'citizenship',
        base_rent: room ? room.baseRent || room.base_rent : 0,
      }) as any as T;
    }
    
    const list = getTable(table);
    const result = list.filter(item => {
      return Object.keys(whereData).every(k => item[k] == whereData[k] || item[toCamelCase(k)] == whereData[k]);
    });
    
    if (result.length === 0) return null;
    
    if (table === 'meter_readings') {
      result.sort((a, b) => (b.created_at || b.createdAt || '').localeCompare(a.created_at || a.createdAt || ''));
    }
    
    // Custom SUM aggregates
    if (cleanSql.includes('sum(total_due)') || cleanSql.includes('sum(totaldue)')) {
      const total = result.reduce((sum, inv) => sum + (inv.total_due || inv.totalDue || 0), 0);
      return { total } as any as T;
    }
    if (cleanSql.includes('sum(amount_paid)') || cleanSql.includes('sum(amountpaid)')) {
      const total = result.reduce((sum, p) => sum + (p.amount_paid || p.amountPaid || 0), 0);
      return { total } as any as T;
    }
    
    return mapToDrizzleFormat(result[0]) as T;
  }

  prepareSync(sql: string) {
    console.log('[Web DB] prepareSync SQL:', sql);
    return new WebSqliteStatement(this, sql);
  }

  async prepareAsync(sql: string) {
    console.log('[Web DB] prepareAsync SQL:', sql);
    return new WebSqliteStatement(this, sql);
  }
}

// Convert camelCase columns to snake_case equivalent or vice versa to ensure Drizzle mapper reads correctly
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
}

function mapToDrizzleFormat(obj: any): any {
  if (!obj) return obj;
  const mapped: any = {};
  Object.keys(obj).forEach(key => {
    const cleanKey = key.trim();
    mapped[cleanKey] = obj[key];
    const camel = toCamelCase(cleanKey);
    if (camel !== cleanKey) {
      mapped[camel] = obj[key];
    }
  });
  return mapped;
}

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
  if (Platform.OS === 'web') {
    // Repair and trim any keys in localStorage from previous test runs
    const tables = ['houses', 'rooms', 'tenants', 'tenancies', 'meter_readings', 'invoices', 'payments', 'checkout_settlements', 'room_postings', 'roomPostings'];
    tables.forEach(table => {
      const raw = localStorage.getItem(`db_${table}`);
      if (raw) {
        try {
          const list = JSON.parse(raw);
          if (Array.isArray(list)) {
            const cleaned = list.map(item => {
              if (!item || typeof item !== 'object') return item;
              const cleanItem: any = {};
              Object.keys(item).forEach(k => {
                cleanItem[k.trim()] = item[k];
              });
              return cleanItem;
            });
            localStorage.setItem(`db_${table}`, JSON.stringify(cleaned));
          }
        } catch (e) {
          console.error('Failed to clean table:', table, e);
        }
      }
    });
  } else {
    // Enable foreign key support on native SQLite only
    await db.execAsync('PRAGMA foreign_keys = ON;');
  }
}
