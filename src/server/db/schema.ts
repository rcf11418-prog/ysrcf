/**
 * Drizzle ORM schema entrypoint.
 *
 * Define your database tables here by exporting mysqlTable instances.
 *
 * After modifying this file:
 * 1. Run: npx drizzle-kit generate
 * 2. Run: npx drizzle-kit migrate
 * 3. Call: database__listTables to verify
 */
import { mysqlTable, varchar, boolean, timestamp, text, int, decimal } from 'drizzle-orm/mysql-core';

// BetterAuth required tables
export const user = mysqlTable('user', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const session = mysqlTable('session', {
  id: varchar('id', { length: 36 }).primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
});

export const account = mysqlTable('account', {
  id: varchar('id', { length: 36 }).primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
});

export const verification = mysqlTable('verification', {
  id: varchar('id', { length: 36 }).primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
});

// ─── Franchisee Profiles ──────────────────────────────────────────────────────
export const franchiseeProfiles = mysqlTable('franchisee_profiles', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 }).notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  applicationId: varchar('application_id', { length: 20 }),
  franchiseCode: varchar('franchise_code', { length: 20 }),
  franchiseType: varchar('franchise_type', { length: 50 }),
  mobile: varchar('mobile', { length: 15 }),
  address: text('address'),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  panNumber: varchar('pan_number', { length: 10 }),
  gstNumber: varchar('gst_number', { length: 15 }),
  profilePhoto: text('profile_photo'),
  // Investment
  totalInvestment: decimal('total_investment', { precision: 14, scale: 2 }).default('0'),
  paidAmount: decimal('paid_amount', { precision: 14, scale: 2 }).default('0'),
  pendingAmount: decimal('pending_amount', { precision: 14, scale: 2 }).default('0'),
  // Progress
  progressStage: int('progress_stage').default(0), // 0-12
  progressPercent: int('progress_percent').default(0),
  status: varchar('status', { length: 30 }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── Franchise Progress Stages ────────────────────────────────────────────────
export const franchiseProgress = mysqlTable('franchise_progress', {
  id: int('id').primaryKey().autoincrement(),
  franchiseeId: int('franchisee_id').notNull().references(() => franchiseeProfiles.id, { onDelete: 'cascade' }),
  stage: int('stage').notNull(), // 0-12
  stageName: varchar('stage_name', { length: 100 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending / in_progress / completed
  remarks: text('remarks'),
  completedAt: timestamp('completed_at'),
  updatedBy: varchar('updated_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Payments ─────────────────────────────────────────────────────────────────
export const payments = mysqlTable('payments', {
  id: int('id').primaryKey().autoincrement(),
  franchiseeId: int('franchisee_id').notNull().references(() => franchiseeProfiles.id, { onDelete: 'cascade' }),
  transactionId: varchar('transaction_id', { length: 50 }).notNull().unique(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp('payment_date').notNull(),
  paymentMode: varchar('payment_mode', { length: 30 }), // NEFT / RTGS / Cheque / UPI / Cash
  referenceNumber: varchar('reference_number', { length: 100 }),
  purpose: varchar('purpose', { length: 255 }),
  status: varchar('status', { length: 20 }).default('completed'), // pending / completed / failed
  remarks: text('remarks'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Invoices ─────────────────────────────────────────────────────────────────
export const invoices = mysqlTable('invoices', {
  id: int('id').primaryKey().autoincrement(),
  franchiseeId: int('franchisee_id').notNull().references(() => franchiseeProfiles.id, { onDelete: 'cascade' }),
  invoiceNumber: varchar('invoice_number', { length: 30 }).notNull().unique(),
  invoiceDate: timestamp('invoice_date').notNull(),
  dueDate: timestamp('due_date'),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 12, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('unpaid'), // unpaid / paid / overdue
  description: text('description'),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Documents ────────────────────────────────────────────────────────────────
export const documents = mysqlTable('documents', {
  id: int('id').primaryKey().autoincrement(),
  franchiseeId: int('franchisee_id').notNull().references(() => franchiseeProfiles.id, { onDelete: 'cascade' }),
  docType: varchar('doc_type', { length: 50 }).notNull(), // agreement / kyc / certificate / other
  docName: varchar('doc_name', { length: 255 }).notNull(),
  fileUrl: text('file_url').notNull(),
  uploadedBy: varchar('uploaded_by', { length: 50 }).default('admin'), // admin / franchisee
  expiryDate: timestamp('expiry_date'),
  status: varchar('status', { length: 20 }).default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Notifications ────────────────────────────────────────────────────────────
export const notifications = mysqlTable('notifications', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 }).notNull().references(() => user.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  type: varchar('type', { length: 30 }).default('info'), // info / success / warning / alert
  isRead: boolean('is_read').default(false),
  link: varchar('link', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Support Tickets ──────────────────────────────────────────────────────────
export const supportTickets = mysqlTable('support_tickets', {
  id: int('id').primaryKey().autoincrement(),
  franchiseeId: int('franchisee_id').notNull().references(() => franchiseeProfiles.id, { onDelete: 'cascade' }),
  ticketNumber: varchar('ticket_number', { length: 20 }).notNull().unique(),
  subject: varchar('subject', { length: 255 }).notNull(),
  description: text('description').notNull(),
  category: varchar('category', { length: 50 }), // Technical / Payment / Delivery / General
  priority: varchar('priority', { length: 20 }).default('medium'), // low / medium / high / urgent
  status: varchar('status', { length: 20 }).default('open'), // open / in_progress / resolved / closed
  assignedTo: varchar('assigned_to', { length: 100 }),
  resolvedAt: timestamp('resolved_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const supportMessages = mysqlTable('support_messages', {
  id: int('id').primaryKey().autoincrement(),
  ticketId: int('ticket_id').notNull().references(() => supportTickets.id, { onDelete: 'cascade' }),
  senderType: varchar('sender_type', { length: 20 }).notNull(), // franchisee / staff
  senderName: varchar('sender_name', { length: 100 }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


// ─── Products & Warehouses ────────────────────────────────────────────────────
export const products = mysqlTable('products', {
  id: int('id').primaryKey().autoincrement(),
  sku: varchar('sku', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }),
  unit: varchar('unit', { length: 30 }).notNull().default('bag'),
  salePrice: decimal('sale_price', { precision: 12, scale: 2 }).notNull().default('0'),
  gstRate: decimal('gst_rate', { precision: 5, scale: 2 }).notNull().default('0'),
  minStockLevel: int('min_stock_level').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const warehouses = mysqlTable('warehouses', {
  id: int('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 20 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  city: varchar('city', { length: 100 }),
  state: varchar('state', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Singleton admin-controlled public company/franchise and finance configuration.
// Sensitive payment details are stored encrypted by the application layer.
export const franchiseSettings = mysqlTable('franchise_settings', {
  id: int('id').primaryKey(),
  franchiseTypes: text('franchise_types').notNull(),
  investmentCategories: text('investment_categories').notNull(),
  legalName: varchar('legal_name', { length: 255 }),
  gstin: varchar('gstin', { length: 15 }),
  pan: varchar('pan', { length: 10 }),
  registeredAddress: text('registered_address'),
  state: varchar('state', { length: 100 }),
  stateCode: varchar('state_code', { length: 2 }),
  paymentDetailsCiphertext: text('payment_details_ciphertext'),
  paymentDetailsPublished: boolean('payment_details_published').notNull().default(false),
  updatedBy: varchar('updated_by', { length: 36 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Franchisee-held stock, one row per product + batch (updated on delivery).
export const franchiseeStock = mysqlTable('franchisee_stock', {
  id: int('id').primaryKey().autoincrement(),
  franchiseeId: int('franchisee_id').notNull().references(() => franchiseeProfiles.id, { onDelete: 'cascade' }),
  productId: int('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  batchNumber: varchar('batch_number', { length: 64 }).notNull().default(''),
  quantity: int('quantity').notNull().default(0),
  reserved: int('reserved').notNull().default(0),
  expiryDate: timestamp('expiry_date'),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// Append-only audit trail of every stock movement.
export const stockMovements = mysqlTable('stock_movements', {
  id: int('id').primaryKey().autoincrement(),
  productId: int('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  franchiseeId: int('franchisee_id').references(() => franchiseeProfiles.id, { onDelete: 'set null' }),
  warehouseId: int('warehouse_id').references(() => warehouses.id, { onDelete: 'set null' }),
  batchNumber: varchar('batch_number', { length: 64 }).notNull().default(''),
  movementType: varchar('movement_type', { length: 20 }).notNull(), // stock_in / stock_out / transfer / adjustment / damaged / returned / reserved
  quantity: int('quantity').notNull(), // signed
  referenceNumber: varchar('reference_number', { length: 50 }),
  remarks: text('remarks'),
  performedBy: varchar('performed_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Orders & Deliveries ──────────────────────────────────────────────────────
export const orders = mysqlTable('orders', {
  id: int('id').primaryKey().autoincrement(),
  orderId: varchar('order_id', { length: 20 }).notNull().unique(),
  franchiseeId: int('franchisee_id').notNull().references(() => franchiseeProfiles.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 30 }).notNull().default('order_received'),
  totalAmount: decimal('total_amount', { precision: 14, scale: 2 }).notNull().default('0'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const orderItems = mysqlTable('order_items', {
  id: int('id').primaryKey().autoincrement(),
  orderId: int('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: int('product_id').notNull().references(() => products.id, { onDelete: 'restrict' }),
  quantity: int('quantity').notNull(),
  rate: decimal('rate', { precision: 12, scale: 2 }).notNull(),
});

export const deliveries = mysqlTable('deliveries', {
  id: int('id').primaryKey().autoincrement(),
  deliveryId: varchar('delivery_id', { length: 20 }).notNull().unique(),
  orderId: int('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  warehouseId: int('warehouse_id').references(() => warehouses.id, { onDelete: 'set null' }),
  transporter: varchar('transporter', { length: 150 }),
  vehicleNumber: varchar('vehicle_number', { length: 30 }),
  driverName: varchar('driver_name', { length: 100 }),
  trackingNumber: varchar('tracking_number', { length: 60 }),
  dispatchDate: timestamp('dispatch_date'),
  expectedDeliveryDate: timestamp('expected_delivery_date'),
  actualDeliveryDate: timestamp('actual_delivery_date'),
  status: varchar('status', { length: 30 }).notNull().default('processing'),
  proofOfDeliveryUrl: text('proof_of_delivery_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

// ─── Staff RBAC ───────────────────────────────────────────────────────────────
// Users with user.isAdmin are super admins. Other staff get a role here.
export const staffMembers = mysqlTable('staff_members', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 36 }).notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 30 }).notNull(), // operations / finance / support / viewer
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Append-only record of every admin write action.
export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  actorId: varchar('actor_id', { length: 36 }).notNull(),
  actorName: varchar('actor_name', { length: 100 }),
  action: varchar('action', { length: 60 }).notNull(), // e.g. application.review
  entityType: varchar('entity_type', { length: 40 }).notNull(),
  entityId: varchar('entity_id', { length: 40 }),
  details: text('details'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ─── Franchise Applications ───────────────────────────────────────────────────
export const franchiseApplications = mysqlTable('franchise_applications', {
  id: int('id').primaryKey().autoincrement(),
  applicationId: varchar('application_id', { length: 20 }).notNull().unique(), // RCF- + 16 hexadecimal characters

  // Personal Details
  fullName: varchar('full_name', { length: 255 }).notNull(),
  mobile: varchar('mobile', { length: 15 }).notNull(),
  whatsapp: varchar('whatsapp', { length: 15 }),
  email: varchar('email', { length: 255 }).notNull(),
  dateOfBirth: varchar('date_of_birth', { length: 10 }),
  gender: varchar('gender', { length: 10 }),

  // Identity
  panNumber: varchar('pan_number', { length: 10 }).notNull(),
  aadhaarNumber: varchar('aadhaar_number', { length: 12 }).notNull(),
  gstNumber: varchar('gst_number', { length: 15 }),

  // Address
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: varchar('city', { length: 100 }).notNull(),
  district: varchar('district', { length: 100 }).notNull(),
  state: varchar('state', { length: 100 }).notNull(),
  pincode: varchar('pincode', { length: 6 }).notNull(),

  // Business Details
  businessName: varchar('business_name', { length: 255 }),
  businessType: varchar('business_type', { length: 100 }),
  yearsInBusiness: varchar('years_in_business', { length: 10 }),
  existingFertilizerDealer: boolean('existing_fertilizer_dealer').default(false),
  currentBrands: text('current_brands'),
  shopArea: varchar('shop_area', { length: 50 }),
  warehouseArea: varchar('warehouse_area', { length: 50 }),

  // Franchise Preference
  franchiseType: varchar('franchise_type', { length: 50 }).notNull(), // Retailer / Block Distributor / District Distributor
  preferredLocation: varchar('preferred_location', { length: 255 }).notNull(),
  coverageArea: text('coverage_area'),
  investmentCapacity: decimal('investment_capacity', { precision: 12, scale: 2 }).notNull(),

  // Bank Details
  bankName: varchar('bank_name', { length: 255 }),
  accountNumber: varchar('account_number', { length: 20 }),
  ifscCode: varchar('ifsc_code', { length: 11 }),
  accountHolderName: varchar('account_holder_name', { length: 255 }),

  // Document paths are stored outside the public web root.
  panDocument: text('pan_document'),
  aadhaarDocument: text('aadhaar_document'),
  gstDocument: text('gst_document'),
  addressProof: text('address_proof'),
  bankStatement: text('bank_statement'),
  shopPhoto: text('shop_photo'),
  passportPhoto: text('passport_photo'),

  // Status
  status: varchar('status', { length: 30 }).notNull().default('submitted'), // submitted / under_review / approved / rejected / on_hold
  remarks: text('remarks'),
  reviewedBy: varchar('reviewed_by', { length: 100 }),
  reviewedAt: timestamp('reviewed_at'),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});
