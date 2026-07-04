import { getDB } from '../../database/connection';

export interface Payment {
  id: string;
  invoice_id: string;
  amount_paid: number;
  payment_method: 'cash' | 'esewa' | 'khalti' | 'bank_transfer';
  payment_date: string;
  receipt_image_url: string | null;
  is_confirmed: number; // 0 = pending, 1 = confirmed
  otp_code: string | null;
  signature_data: string | null; // Stores SVG path string or base64 representation
  created_at: string;
}

export async function initPaymentSchema(): Promise<void> {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY NOT NULL,
      invoice_id TEXT NOT NULL,
      amount_paid REAL NOT NULL,
      payment_method TEXT NOT NULL, -- 'cash' | 'esewa' | 'khalti' | 'bank_transfer'
      payment_date TEXT NOT NULL,
      receipt_image_url TEXT,
      is_confirmed INTEGER DEFAULT 0,
      otp_code TEXT,
      signature_data TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    );
  `);
}

// Add a payment transaction record
export async function addPayment(payment: Payment): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO payments (id, invoice_id, amount_paid, payment_method, payment_date, receipt_image_url, is_confirmed, otp_code, signature_data, created_at) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      payment.id,
      payment.invoice_id,
      payment.amount_paid,
      payment.payment_method,
      payment.payment_date,
      payment.receipt_image_url,
      payment.is_confirmed,
      payment.otp_code,
      payment.signature_data,
      payment.created_at,
    ]
  );
  
  // Re-calculate the invoice status based on total paid amount
  await syncInvoiceStatus(payment.invoice_id);
}

// Get all payments recorded for a specific invoice
export async function getPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
  const db = await getDB();
  return await db.getAllAsync<Payment>(
    'SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC;',
    [invoiceId]
  );
}

// Calculate total paid amount for an invoice
export async function getTotalPaidForInvoice(invoiceId: string): Promise<number> {
  const db = await getDB();
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT SUM(amount_paid) as total FROM payments WHERE invoice_id = ? AND is_confirmed = 1;',
    [invoiceId]
  );
  return result?.total || 0;
}

// Automatically recalculate and set invoice status
async function syncInvoiceStatus(invoiceId: string): Promise<void> {
  const db = await getDB();
  
  // Fetch total due
  const invoice = await db.getFirstAsync<{ total_due: number }>(
    'SELECT total_due FROM invoices WHERE id = ?;',
    [invoiceId]
  );
  if (!invoice) return;

  const totalPaid = await getTotalPaidForInvoice(invoiceId);
  
  let newStatus: 'unpaid' | 'partially_paid' | 'paid' = 'unpaid';
  if (totalPaid >= invoice.total_due) {
    newStatus = 'paid';
  } else if (totalPaid > 0) {
    newStatus = 'partially_paid';
  }

  await db.runAsync('UPDATE invoices SET status = ? WHERE id = ?;', [newStatus, invoiceId]);
}
