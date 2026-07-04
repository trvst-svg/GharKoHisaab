import { getDB } from '../../database/connection';

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
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO checkout_settlements (
      id, tenancy_id, checkout_date, final_rent_due, final_utility_due, 
      damage_charges, deducted_deposit, refunded_deposit, net_balance, is_settled, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      settlement.id,
      settlement.tenancy_id,
      settlement.checkout_date,
      settlement.final_rent_due,
      settlement.final_utility_due,
      settlement.damage_charges,
      settlement.deducted_deposit,
      settlement.refunded_deposit,
      settlement.net_balance,
      settlement.is_settled,
      settlement.created_at,
    ]
  );
}

export async function getCheckoutSettlement(tenancyId: string): Promise<CheckoutSettlement | null> {
  const db = await getDB();
  const result = await db.getFirstAsync<CheckoutSettlement>(
    'SELECT * FROM checkout_settlements WHERE tenancy_id = ? LIMIT 1;',
    [tenancyId]
  );
  return result || null;
}

export async function terminateTenancy(
  tenancyId: string,
  roomId: string,
  endDate: string,
  depositStatus: 'refunded' | 'applied_to_dues' | 'held'
): Promise<void> {
  const db = await getDB();
  
  // 1. Update the tenancy record
  await db.runAsync(
    'UPDATE tenancies SET is_active = 0, end_date = ?, security_deposit_status = ? WHERE id = ?;',
    [endDate, depositStatus, tenancyId]
  );
  
  // 2. Set the room status back to vacant
  await db.runAsync(
    'UPDATE rooms SET status = ? WHERE id = ?;',
    ['vacant', roomId]
  );
}
