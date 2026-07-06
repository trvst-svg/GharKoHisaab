import { getDB, getDrizzleDB } from '../../database/connection';
import { tenantReviews, propertyReviews, tenants } from '../../database/schema';
import { eq } from 'drizzle-orm';

export interface TenantReview {
  id: string;
  tenancy_id: string;
  tenant_id: string;
  rating: number;
  comments: string | null;
  created_at: string;
}

export interface PropertyReview {
  id: string;
  tenancy_id: string;
  house_id: string;
  rating: number;
  comments: string | null;
  created_at: string;
}

// Bootstraps review tables in the local SQLite engine
export async function initReviewSchema(): Promise<void> {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS tenant_reviews (
      id TEXT PRIMARY KEY NOT NULL,
      tenancy_id TEXT NOT NULL,
      tenant_id TEXT NOT NULL,
      rating REAL NOT NULL,
      comments TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenancy_id) REFERENCES tenancies(id) ON DELETE CASCADE,
      FOREIGN KEY(tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS property_reviews (
      id TEXT PRIMARY KEY NOT NULL,
      tenancy_id TEXT NOT NULL,
      house_id TEXT NOT NULL,
      rating REAL NOT NULL,
      comments TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(tenancy_id) REFERENCES tenancies(id) ON DELETE CASCADE,
      FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE
    );
  `);
}

// Add a tenant review and recalculate their average rating
export async function addTenantReview(review: {
  id: string;
  tenancyId: string;
  tenantId: string;
  rating: number;
  comments: string;
}): Promise<void> {
  const db = await getDrizzleDB();
  
  // 1. Insert review record
  await db.insert(tenantReviews).values({
    id: review.id,
    tenancyId: review.tenancyId,
    tenantId: review.tenantId,
    rating: review.rating,
    comments: review.comments,
  });

  // 2. Query all reviews for the tenant to recalculate average score
  const reviews = await db
    .select({ rating: tenantReviews.rating })
    .from(tenantReviews)
    .where(eq(tenantReviews.tenantId, review.tenantId));

  if (reviews.length > 0) {
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = total / reviews.length;
    
    // 3. Update rating in tenants profile
    await db
      .update(tenants)
      .set({ rating: parseFloat(avgRating.toFixed(1)) })
      .where(eq(tenants.id, review.tenantId));
  }
}

// Add a property review from a tenant
export async function addPropertyReview(review: {
  id: string;
  tenancyId: string;
  houseId: string;
  rating: number;
  comments: string;
}): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(propertyReviews).values({
    id: review.id,
    tenancyId: review.tenancyId,
    houseId: review.houseId,
    rating: review.rating,
    comments: review.comments,
  });
}

// Fetch all reviews for a tenant
export async function getReviewsForTenant(tenantId: string): Promise<any[]> {
  const db = await getDrizzleDB();
  return await db
    .select()
    .from(tenantReviews)
    .where(eq(tenantReviews.tenantId, tenantId));
}

// Fetch all reviews for a property
export async function getReviewsForProperty(houseId: string): Promise<any[]> {
  const db = await getDrizzleDB();
  return await db
    .select()
    .from(propertyReviews)
    .where(eq(propertyReviews.houseId, houseId));
}
