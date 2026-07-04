import { getDB } from '../../database/connection';

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
  const db = await getDB();
  await db.runAsync(
    `INSERT INTO room_postings (id, room_id, house_id, title, description, contact_phone, is_active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      posting.id,
      posting.room_id,
      posting.house_id,
      posting.title,
      posting.description,
      posting.contact_phone,
      posting.is_active,
      posting.created_at,
    ]
  );
}

export async function updateRoomPosting(
  postingId: string,
  title: string,
  description: string,
  contactPhone: string
): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'UPDATE room_postings SET title = ?, description = ?, contact_phone = ? WHERE id = ?;',
    [title, description, contactPhone, postingId]
  );
}

export async function deleteRoomPosting(postingId: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM room_postings WHERE id = ?;', [postingId]);
}

export async function getPostingForRoom(roomId: string): Promise<RoomPosting | null> {
  const db = await getDB();
  const result = await db.getFirstAsync<RoomPosting>(
    'SELECT * FROM room_postings WHERE room_id = ? LIMIT 1;',
    [roomId]
  );
  return result || null;
}

export async function getAllPublicPostings(): Promise<PublicPostingItem[]> {
  const db = await getDB();
  return await db.getAllAsync<PublicPostingItem>(`
    SELECT 
      rp.*, 
      r.room_number, 
      r.base_rent, 
      h.name as house_name, 
      h.address as house_address,
      h.housekeeper_name
    FROM room_postings rp
    JOIN rooms r ON rp.room_id = r.id
    JOIN houses h ON rp.house_id = h.id
    WHERE rp.is_active = 1 AND r.status = 'vacant'
    ORDER BY rp.created_at DESC;
  `);
}
