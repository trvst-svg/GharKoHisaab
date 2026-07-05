import { getDB, getDrizzleDB } from '../../database/connection';
import { invoices, meterReadings, payments } from '../../database/schema';
import { eq, desc, sum, inArray } from 'drizzle-orm';

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
  const db = await getDrizzleDB();
  const allInvoices = await db.select()
    .from(invoices)
    .where(eq(invoices.tenancyId, tenancyId))
    .orderBy(desc(invoices.createdAt));

  return allInvoices.map(inv => ({
    id: inv.id,
    tenancy_id: inv.tenancyId,
    billing_period: inv.billingPeriod,
    rent_due: inv.rentDue,
    electricity_due: inv.electricityDue || 0,
    water_due: inv.waterDue || 0,
    waste_due: inv.wasteDue || 0,
    arrears_carried_forward: inv.arrearsCarriedForward || 0,
    total_due: inv.totalDue,
    status: inv.status as 'unpaid' | 'partially_paid' | 'paid',
    created_at: inv.createdAt || '',
  }));
}

// Get the last meter reading recorded for a tenancy to use as previous reading
export async function getLastMeterReading(tenancyId: string): Promise<MeterReading | null> {
  const db = await getDrizzleDB();
  const results = await db.select()
    .from(meterReadings)
    .where(eq(meterReadings.tenancyId, tenancyId))
    .orderBy(desc(meterReadings.createdAt))
    .limit(1);

  if (results.length === 0) return null;
  const result = results[0];

  return {
    id: result.id,
    tenancy_id: result.tenancyId,
    reading_date: result.readingDate,
    electricity_reading: result.electricityReading,
    water_reading: result.waterReading,
    created_at: result.createdAt || '',
  };
}

// Add a new meter reading
export async function addMeterReading(reading: MeterReading): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(meterReadings).values({
    id: reading.id,
    tenancyId: reading.tenancy_id,
    readingDate: reading.reading_date,
    electricityReading: reading.electricity_reading,
    waterReading: reading.water_reading,
    createdAt: reading.created_at,
  });
}

// Add a new invoice
export async function addInvoice(invoice: Invoice): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(invoices).values({
    id: invoice.id,
    tenancyId: invoice.tenancy_id,
    billingPeriod: invoice.billing_period,
    rentDue: invoice.rent_due,
    electricityDue: invoice.electricity_due,
    waterDue: invoice.water_due,
    wasteDue: invoice.waste_due,
    arrearsCarriedForward: invoice.arrears_carried_forward,
    totalDue: invoice.total_due,
    status: invoice.status,
    createdAt: invoice.created_at,
  });
}

// Calculate outstanding arrears (unpaid / partially paid invoice balances) for a tenancy
export async function calculateArrearsForTenancy(tenancyId: string): Promise<number> {
  const db = await getDrizzleDB();
  
  // Total due from all invoices
  const totalDueResult = await db.select({ total: sum(invoices.totalDue) })
    .from(invoices)
    .where(eq(invoices.tenancyId, tenancyId));
  
  let totalPaid = 0;
  try {
    const invoiceIds = await db.select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.tenancyId, tenancyId));

    if (invoiceIds.length > 0) {
      const ids = invoiceIds.map(inv => inv.id);
      const totalPaidResult = await db.select({ total: sum(payments.amountPaid) })
        .from(payments)
        .where(inArray(payments.invoiceId, ids));
      totalPaid = Number(totalPaidResult[0]?.total || 0);
    }
  } catch (e) {
    // Payments table might not exist or empty
    totalPaid = 0;
  }

  const totalDue = Number(totalDueResult[0]?.total || 0);
  const arrears = totalDue - totalPaid;
  return arrears > 0 ? arrears : 0;
}
