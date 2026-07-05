import { sqliteTable, text, real, integer } from 'drizzle-orm/sqlite-core';

export const houses = sqliteTable('houses', {
  id: text('id').primaryKey(),
  housekeeperName: text('housekeeper_name').notNull(),
  name: text('name').notNull(),
  address: text('address').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const rooms = sqliteTable('rooms', {
  id: text('id').primaryKey(),
  houseId: text('house_id').notNull().references(() => houses.id, { onDelete: 'cascade' }),
  roomNumber: text('room_number').notNull(),
  baseRent: real('base_rent').notNull(),
  status: text('status').notNull(), // 'vacant' | 'occupied'
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const roomPostings = sqliteTable('room_postings', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().unique().references(() => rooms.id, { onDelete: 'cascade' }),
  houseId: text('house_id').notNull().references(() => houses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  contactPhone: text('contact_phone').notNull(),
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const tenants = sqliteTable('tenants', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  phoneNumber: text('phone_number').notNull().unique(),
  governmentIdUrl: text('government_id_url'),
  governmentIdType: text('government_id_type').notNull(), // 'citizenship' | 'license' | 'passport'
  rating: real('rating').default(5.0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const tenancies = sqliteTable('tenancies', {
  id: text('id').primaryKey(),
  roomId: text('room_id').notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  securityDepositAmount: real('security_deposit_amount').default(0),
  securityDepositStatus: text('security_deposit_status').default('held'), // 'held' | 'refunded' | 'applied_to_dues'
  isActive: integer('is_active').default(1),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const checkoutSettlements = sqliteTable('checkout_settlements', {
  id: text('id').primaryKey(),
  tenancyId: text('tenancy_id').notNull().references(() => tenancies.id, { onDelete: 'cascade' }),
  checkoutDate: text('checkout_date').notNull(),
  finalRentDue: real('final_rent_due').default(0),
  finalUtilityDue: real('final_utility_due').default(0),
  damageCharges: real('damage_charges').default(0),
  deductedDeposit: real('deducted_deposit').default(0),
  refundedDeposit: real('refunded_deposit').default(0),
  netBalance: real('net_balance').notNull(),
  isSettled: integer('is_settled').default(0),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey(),
  tenancyId: text('tenancy_id').notNull().references(() => tenancies.id, { onDelete: 'cascade' }),
  billingPeriod: text('billing_period').notNull(),
  rentDue: real('rent_due').notNull(),
  electricityDue: real('electricity_due').default(0),
  waterDue: real('water_due').default(0),
  wasteDue: real('waste_due').default(0),
  arrearsCarriedForward: real('arrears_carried_forward').default(0),
  totalDue: real('total_due').notNull(),
  status: text('status').notNull().default('unpaid'), // 'unpaid' | 'partially_paid' | 'paid'
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const meterReadings = sqliteTable('meter_readings', {
  id: text('id').primaryKey(),
  tenancyId: text('tenancy_id').notNull().references(() => tenancies.id, { onDelete: 'cascade' }),
  readingDate: text('reading_date').notNull(),
  electricityReading: real('electricity_reading').notNull(),
  waterReading: real('water_reading').notNull(),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  invoiceId: text('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
  amountPaid: real('amount_paid').notNull(),
  paymentMethod: text('payment_method').notNull(), // 'cash' | 'esewa' | 'khalti' | 'bank_transfer'
  paymentDate: text('payment_date').notNull(),
  receiptImageUrl: text('receipt_image_url'),
  isConfirmed: integer('is_confirmed').default(0),
  otpCode: text('otp_code'),
  signatureData: text('signature_data'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
});
