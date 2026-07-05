import { getDB, getDrizzleDB } from '../../database/connection';
import { checkoutSettlements, tenancies, rooms } from '../../database/schema';
import { eq } from 'drizzle-orm';

export interface CheckoutSettlement {
  id: string;
  tenancy_id: string;
  checkout_date: string; // ISO date string of checkout
  final_rent_due: number;
  final_utility_due: number;
  damage_charges: number;
  deducted_deposit: number;
  refunded_deposit: number;
  net_balance: number;
  is_settled: number; // 0 = false, 1 = true
  created_at: string;
}

export async function initCheckoutSchema(): Promise<void> {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS checkout_settlements (
      id TEXT PRIMARY KEY NOT NULL,
      tenancy_id TEXT NOT NULL,
      checkout_date TEXT NOT NULL,
      final_rent_due REAL DEFAULT 0,
      final_utility_due REAL DEFAULT 0,
      damage_charges REAL DEFAULT 0,
      deducted_deposit REAL DEFAULT 0,
      refunded_deposit REAL DEFAULT 0,
      net_balance REAL NOT NULL,
      is_settled INTEGER DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenancy_id) REFERENCES tenancies(id) ON DELETE CASCADE
    );
  `);
}

export async function addCheckoutSettlement(settlement: CheckoutSettlement): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(checkoutSettlements).values({
    id: settlement.id,
    tenancyId: settlement.tenancy_id,
    checkoutDate: settlement.checkout_date,
    finalRentDue: settlement.final_rent_due,
    finalUtilityDue: settlement.final_utility_due,
    damageCharges: settlement.damage_charges,
    deductedDeposit: settlement.deducted_deposit,
    refundedDeposit: settlement.refunded_deposit,
    netBalance: settlement.net_balance,
    isSettled: settlement.is_settled,
    createdAt: settlement.created_at,
  });
}

export async function getCheckoutSettlement(tenancyId: string): Promise<CheckoutSettlement | null> {
  const db = await getDrizzleDB();
  const results = await db.select()
    .from(checkoutSettlements)
    .where(eq(checkoutSettlements.tenancyId, tenancyId))
    .limit(1);

  if (results.length === 0) return null;
  const result = results[0];

  return {
    id: result.id,
    tenancy_id: result.tenancyId,
    checkout_date: result.checkoutDate,
    final_rent_due: result.finalRentDue || 0,
    final_utility_due: result.finalUtilityDue || 0,
    damage_charges: result.damageCharges || 0,
    deducted_deposit: result.deductedDeposit || 0,
    refunded_deposit: result.refundedDeposit || 0,
    net_balance: result.netBalance,
    is_settled: result.isSettled || 0,
    created_at: result.createdAt || '',
  };
}

export async function terminateTenancy(
  tenancyId: string,
  roomId: string,
  endDate: string,
  depositStatus: 'refunded' | 'applied_to_dues' | 'held'
): Promise<void> {
  const db = await getDrizzleDB();
  
  // 1. Update the tenancy record
  await db.update(tenancies).set({
    isActive: 0,
    endDate: endDate,
    securityDepositStatus: depositStatus,
  }).where(eq(tenancies.id, tenancyId));
  
  // 2. Set the room status back to vacant
  await db.update(rooms).set({ status: 'vacant' }).where(eq(rooms.id, roomId));
}
