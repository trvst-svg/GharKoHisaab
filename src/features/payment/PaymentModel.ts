import { getDB, getDrizzleDB } from '../../database/connection';
import { payments, invoices } from '../../database/schema';
import { eq, and, desc, sum } from 'drizzle-orm';

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
  const db = await getDrizzleDB();
  await db.insert(payments).values({
    id: payment.id,
    invoiceId: payment.invoice_id,
    amountPaid: payment.amount_paid,
    paymentMethod: payment.payment_method,
    paymentDate: payment.payment_date,
    receiptImageUrl: payment.receipt_image_url,
    isConfirmed: payment.is_confirmed,
    otpCode: payment.otp_code,
    signatureData: payment.signature_data,
    createdAt: payment.created_at,
  });
  
  // Re-calculate the invoice status based on total paid amount
  await syncInvoiceStatus(payment.invoice_id);
}

// Get all payments recorded for a specific invoice
export async function getPaymentsForInvoice(invoiceId: string): Promise<Payment[]> {
  const db = await getDrizzleDB();
  const results = await db.select()
    .from(payments)
    .where(eq(payments.invoiceId, invoiceId))
    .orderBy(desc(payments.paymentDate));

  return results.map(p => ({
    id: p.id,
    invoice_id: p.invoiceId,
    amount_paid: p.amountPaid,
    payment_method: p.paymentMethod as any,
    payment_date: p.paymentDate,
    receipt_image_url: p.receiptImageUrl,
    is_confirmed: p.isConfirmed || 0,
    otp_code: p.otpCode,
    signature_data: p.signatureData,
    created_at: p.createdAt || '',
  }));
}

// Calculate total paid amount for an invoice
export async function getTotalPaidForInvoice(invoiceId: string): Promise<number> {
  const db = await getDrizzleDB();
  const results = await db.select({ total: sum(payments.amountPaid) })
    .from(payments)
    .where(and(eq(payments.invoiceId, invoiceId), eq(payments.isConfirmed, 1)));

  return Number(results[0]?.total || 0);
}

// Automatically recalculate and set invoice status
async function syncInvoiceStatus(invoiceId: string): Promise<void> {
  const db = await getDrizzleDB();
  
  // Fetch total due
  const invoiceResults = await db.select({ totalDue: invoices.totalDue })
    .from(invoices)
    .where(eq(invoices.id, invoiceId))
    .limit(1);

  if (invoiceResults.length === 0) return;
  const invoice = invoiceResults[0];

  const totalPaid = await getTotalPaidForInvoice(invoiceId);
  
  let newStatus: 'unpaid' | 'partially_paid' | 'paid' = 'unpaid';
  if (totalPaid >= invoice.totalDue) {
    newStatus = 'paid';
  } else if (totalPaid > 0) {
    newStatus = 'partially_paid';
  }

  await db.update(invoices).set({ status: newStatus }).where(eq(invoices.id, invoiceId));
}
