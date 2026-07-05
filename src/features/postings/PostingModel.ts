import { getDB, getDrizzleDB } from '../../database/connection';
import { roomPostings, rooms, houses } from '../../database/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface RoomPosting {
  id: string;
  room_id: string;
  house_id: string;
  title: string;
  description: string;
  contact_phone: string;
  is_active: number; // 1 = active, 0 = inactive
  created_at: string;
}

export interface PublicPostingItem {
  id: string;
  room_id: string;
  house_id: string;
  title: string;
  description: string;
  contact_phone: string;
  is_active: number;
  created_at: string;
  // Joined Fields
  room_number: string;
  base_rent: number;
  house_name: string;
  house_address: string;
  housekeeper_name: string;
}

export async function initPostingSchema(): Promise<void> {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS room_postings (
      id TEXT PRIMARY KEY NOT NULL,
      room_id TEXT UNIQUE NOT NULL,
      house_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      contact_phone TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(room_id) REFERENCES rooms(id) ON DELETE CASCADE,
      FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE
    );
  `);
}

export async function addRoomPosting(posting: RoomPosting): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(roomPostings).values({
    id: posting.id,
    roomId: posting.room_id,
    houseId: posting.house_id,
    title: posting.title,
    description: posting.description,
    contactPhone: posting.contact_phone,
    isActive: posting.is_active,
    createdAt: posting.created_at,
  });
}

export async function updateRoomPosting(
  postingId: string,
  title: string,
  description: string,
  contactPhone: string
): Promise<void> {
  const db = await getDrizzleDB();
  await db.update(roomPostings).set({
    title,
    description,
    contactPhone,
  }).where(eq(roomPostings.id, postingId));
}

export async function deleteRoomPosting(postingId: string): Promise<void> {
  const db = await getDrizzleDB();
  await db.delete(roomPostings).where(eq(roomPostings.id, postingId));
}

export async function getPostingForRoom(roomId: string): Promise<RoomPosting | null> {
  const db = await getDrizzleDB();
  const results = await db.select()
    .from(roomPostings)
    .where(eq(roomPostings.roomId, roomId))
    .limit(1);

  if (results.length === 0) return null;
  const result = results[0];

  return {
    id: result.id,
    room_id: result.roomId,
    house_id: result.houseId,
    title: result.title,
    description: result.description || '',
    contact_phone: result.contactPhone,
    is_active: result.isActive || 0,
    created_at: result.createdAt || '',
  };
}

export async function getAllPublicPostings(): Promise<PublicPostingItem[]> {
  const db = await getDrizzleDB();
  const results = await db.select({
    rp: roomPostings,
    r: rooms,
    h: houses,
  })
  .from(roomPostings)
  .innerJoin(rooms, eq(roomPostings.roomId, rooms.id))
  .innerJoin(houses, eq(roomPostings.houseId, houses.id))
  .where(and(eq(roomPostings.isActive, 1), eq(rooms.status, 'vacant')))
  .orderBy(desc(roomPostings.createdAt));

  return results.map(row => ({
    id: row.rp.id,
    room_id: row.rp.roomId,
    house_id: row.rp.houseId,
    title: row.rp.title,
    description: row.rp.description || '',
    contact_phone: row.rp.contactPhone,
    is_active: row.rp.isActive || 0,
    created_at: row.rp.createdAt || '',
    room_number: row.r.roomNumber,
    base_rent: row.r.baseRent,
    house_name: row.h.name,
    house_address: row.h.address,
    housekeeper_name: row.h.housekeeperName,
  }));
}
