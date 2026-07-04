import { getDB } from '../../database/connection';

export interface Invoice {
  id: string;
  tenancy_id: string;
  billing_period: string; // E.g., "2083 Shrawan"
  rent_due: number;
  electricity_due: number;
  water_due: number;
  waste_due: number;
  arrears_carried_forward: number;
  total_due: number;
  status: 'unpaid' | 'partially_paid' | 'paid';
  created_at: string;
}

export interface MeterReading {
  id: string;
  tenancy_id: string;
  reading_date: string;
  electricity_reading: number;
  water_reading: number;
  created_at: string;
}

export async function initInvoiceSchema(): Promise<void> {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS invoices (
      id TEXT PRIMARY KEY NOT NULL,
      tenancy_id TEXT NOT NULL,
      billing_period TEXT NOT NULL,
      rent_due REAL NOT NULL,
      electricity_due REAL DEFAULT 0,
      water_due REAL DEFAULT 0,
      waste_due REAL DEFAULT 0,
      arrears_carried_forward REAL DEFAULT 0,
      total_due REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid', -- 'unpaid' | 'partially_paid' | 'paid'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenancy_id) REFERENCES tenancies(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS meter_readings (
      id TEXT PRIMARY KEY NOT NULL,
      tenancy_id TEXT NOT NULL,
      reading_date TEXT NOT NULL,
      electricity_reading REAL NOT NULL,
      water_reading REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenancy_id) REFERENCES tenancies(id) ON DELETE CASCADE
    );
  `);
}

// Get invoices for a tenancy
export async function getInvoicesForTenancy(tenancyId: string): Promise<Invoice[]> {
  const db = await getDB();
  return await db.getAllAsync<Invoice>(
    'SELECT * FROM invoices WHERE tenancy_id = ? ORDER BY created_at DESC;',
    [tenancyId]
  );
}

// Get the last meter reading recorded for a tenancy to use as previous reading
export async function getLastMeterReading(tenancyId: string): Promise<MeterReading | null> {
  const db = await getDB();
  const result = await db.getFirstAsync<MeterReading>(
    'SELECT * FROM meter_readings WHERE tenancy_id = ? ORDER BY created_at DESC LIMIT 1;',
    [tenancyId]
  );
  return result || null;
}

// Add a new meter reading
export async function addMeterReading(reading: MeterReading): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO meter_readings (id, tenancy_id, reading_date, electricity_reading, water_reading, created_at) VALUES (?, ?, ?, ?, ?, ?);',
    [
      reading.id,
      reading.tenancy_id,
      reading.reading_date,
      reading.electricity_reading,
      reading.water_reading,
      reading.created_at,
    ]
  );
}

// Add a new invoice
export async function addInvoice(invoice: Invoice): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO invoices (id, tenancy_id, billing_period, rent_due, electricity_due, water_due, waste_due, arrears_carried_forward, total_due, status, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      invoice.id,
      invoice.tenancy_id,
      invoice.billing_period,
      invoice.rent_due,
      invoice.electricity_due,
      invoice.water_due,
      invoice.waste_due,
      invoice.arrears_carried_forward,
      invoice.total_due,
      invoice.status,
      invoice.created_at,
    ]
  );
}

// Calculate outstanding arrears (unpaid / partially paid invoice balances) for a tenancy
export async function calculateArrearsForTenancy(tenancyId: string): Promise<number> {
  const db = await getDB();
  
  // Total due from all invoices
  const totalDueResult = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(total_due) as total FROM invoices WHERE tenancy_id = ?;',
    [tenancyId]
  );
  
  // Total paid from all payments
  // Note: Payments table might not exist yet, we'll gracefully handle it.
  // If the payments table doesn't exist, paid is 0.
  let totalPaid = 0;
  try {
    const totalPaidResult = await db.getFirstAsync<{ total: number }>(
      'SELECT SUM(amount_paid) as total FROM payments WHERE invoice_id IN (SELECT id FROM invoices WHERE tenancy_id = ?);',
      [tenancyId]
    );
    totalPaid = totalPaidResult?.total || 0;
  } catch (e) {
    // Payments table not initialized yet, treat as 0
    totalPaid = 0;
  }

  const totalDue = totalDueResult?.total || 0;
  const arrears = totalDue - totalPaid;
  return arrears > 0 ? arrears : 0;
}
