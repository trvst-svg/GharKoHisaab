import { getDB } from '../../database/connection';

export interface House {
  id: string;
  housekeeper_name: string;
  name: string;
  address: string;
  created_at: string;
}

export interface Room {
  id: string;
  house_id: string;
  room_number: string;
  base_rent: number;
  status: 'vacant' | 'occupied';
  created_at: string;
}

// SQL Schema definitions to bootstrap this feature's database tables
export async function initPropertySchema(): Promise<void> {
  const db = await getDB();
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS houses (
      id TEXT PRIMARY KEY NOT NULL,
      housekeeper_name TEXT NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS rooms (
      id TEXT PRIMARY KEY NOT NULL,
      house_id TEXT NOT NULL,
      room_number TEXT NOT NULL,
      base_rent REAL NOT NULL,
      status TEXT NOT NULL, -- 'vacant' | 'occupied'
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(house_id) REFERENCES houses(id) ON DELETE CASCADE
    );
  `);
}

// Model Query Executors
export async function getHouses(): Promise<House[]> {
  const db = await getDB();
  return await db.getAllAsync<House>('SELECT * FROM houses ORDER BY created_at ASC;');
}

export async function addHouse(house: House): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO houses (id, housekeeper_name, name, address, created_at) VALUES (?, ?, ?, ?, ?);',
    [house.id, house.housekeeper_name, house.name, house.address, house.created_at]
  );
}

export async function getRoomsForHouse(houseId: string): Promise<Room[]> {
  const db = await getDB();
  return await db.getAllAsync<Room>(
    'SELECT * FROM rooms WHERE house_id = ? ORDER BY room_number ASC;',
    [houseId]
  );
}

export async function addRoom(room: Room): Promise<void> {
  const db = await getDB();
  await db.runAsync(
    'INSERT INTO rooms (id, house_id, room_number, base_rent, status, created_at) VALUES (?, ?, ?, ?, ?, ?);',
    [room.id, room.house_id, room.room_number, room.base_rent, room.status, room.created_at]
  );
}

export async function updateRoomStatus(roomId: string, status: 'vacant' | 'occupied'): Promise<void> {
  const db = await getDB();
  await db.runAsync('UPDATE rooms SET status = ? WHERE id = ?;', [status, roomId]);
}

export async function deleteRoom(roomId: string): Promise<void> {
  const db = await getDB();
  await db.runAsync('DELETE FROM rooms WHERE id = ?;', [roomId]);
}
