import { getDB, getDrizzleDB } from '../../database/connection';
import { tenancyAgreements } from '../../database/schema';
import { eq } from 'drizzle-orm';

export interface Agreement {
  id: string;
  tenancy_id: string;
  base_rent: number;
  security_deposit: number;
  start_date_bs: string;
  electricity_rate: number;
  water_rate: number;
  waste_rate: number;
  special_terms: string | null;
  housekeeper_signature: string | null;
  tenant_signature: string | null;
  signed_at: string | null;
  device_id: string | null;
  created_at: string;
}

/**
 * Bootstrap the tenancy_agreements table (raw SQL, matching existing init patterns).
 */
export async function initAgreementSchema(): Promise<void> {
  const db = await getDB();
  db.runSync(`
    CREATE TABLE IF NOT EXISTS tenancy_agreements (
      id TEXT PRIMARY KEY NOT NULL,
      tenancy_id TEXT NOT NULL REFERENCES tenancies(id) ON DELETE CASCADE,
      base_rent REAL NOT NULL,
      security_deposit REAL DEFAULT 0,
      start_date_bs TEXT NOT NULL,
      electricity_rate REAL DEFAULT 12,
      water_rate REAL DEFAULT 50,
      waste_rate REAL DEFAULT 100,
      special_terms TEXT,
      housekeeper_signature TEXT,
      tenant_signature TEXT,
      signed_at TEXT,
      device_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * Save a new tenancy agreement record.
 */
export async function saveAgreement(agreement: Agreement): Promise<void> {
  const drizzle = await getDrizzleDB();
  await drizzle.insert(tenancyAgreements).values({
    id: agreement.id,
    tenancyId: agreement.tenancy_id,
    baseRent: agreement.base_rent,
    securityDeposit: agreement.security_deposit,
    startDateBs: agreement.start_date_bs,
    electricityRate: agreement.electricity_rate,
    waterRate: agreement.water_rate,
    wasteRate: agreement.waste_rate,
    specialTerms: agreement.special_terms,
    housekeeperSignature: agreement.housekeeper_signature,
    tenantSignature: agreement.tenant_signature,
    signedAt: agreement.signed_at,
    deviceId: agreement.device_id,
    createdAt: agreement.created_at,
  });
}

/**
 * Retrieve the agreement linked to a specific tenancy (if one exists).
 */
export async function getAgreementForTenancy(tenancyId: string): Promise<Agreement | null> {
  const drizzle = await getDrizzleDB();
  const results = await drizzle
    .select()
    .from(tenancyAgreements)
    .where(eq(tenancyAgreements.tenancyId, tenancyId))
    .limit(1);

  if (results.length === 0) return null;

  const row = results[0];
  return {
    id: row.id,
    tenancy_id: row.tenancyId,
    base_rent: row.baseRent,
    security_deposit: row.securityDeposit ?? 0,
    start_date_bs: row.startDateBs,
    electricity_rate: row.electricityRate ?? 12,
    water_rate: row.waterRate ?? 50,
    waste_rate: row.wasteRate ?? 100,
    special_terms: row.specialTerms ?? null,
    housekeeper_signature: row.housekeeperSignature ?? null,
    tenant_signature: row.tenantSignature ?? null,
    signed_at: row.signedAt ?? null,
    device_id: row.deviceId ?? null,
    created_at: row.createdAt ?? new Date().toISOString(),
  };
}
