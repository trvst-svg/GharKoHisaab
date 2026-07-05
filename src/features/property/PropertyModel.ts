import { getDB, getDrizzleDB } from '../../database/connection';
import { houses, rooms } from '../../database/schema';
import { eq, asc } from 'drizzle-orm';

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
  const db = await getDrizzleDB();
  const allHouses = await db.select().from(houses).orderBy(asc(houses.createdAt));
  return allHouses.map(h => ({
    id: h.id,
    housekeeper_name: h.housekeeperName,
    name: h.name,
    address: h.address,
    created_at: h.createdAt || '',
  }));
}

export async function addHouse(house: House): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(houses).values({
    id: house.id,
    housekeeperName: house.housekeeper_name,
    name: house.name,
    address: house.address,
    createdAt: house.created_at,
  });
}

export async function getRoomsForHouse(houseId: string): Promise<Room[]> {
  const db = await getDrizzleDB();
  const allRooms = await db.select().from(rooms).where(eq(rooms.houseId, houseId)).orderBy(asc(rooms.roomNumber));
  return allRooms.map(r => ({
    id: r.id,
    house_id: r.houseId,
    room_number: r.roomNumber,
    base_rent: r.baseRent,
    status: r.status as 'vacant' | 'occupied',
    created_at: r.createdAt || '',
  }));
}

export async function addRoom(room: Room): Promise<void> {
  const db = await getDrizzleDB();
  await db.insert(rooms).values({
    id: room.id,
    houseId: room.house_id,
    roomNumber: room.room_number,
    baseRent: room.base_rent,
    status: room.status,
    createdAt: room.created_at,
  });
}

export async function updateRoomStatus(roomId: string, status: 'vacant' | 'occupied'): Promise<void> {
  const db = await getDrizzleDB();
  await db.update(rooms).set({ status }).where(eq(rooms.id, roomId));
}

export async function deleteRoom(roomId: string): Promise<void> {
  const db = await getDrizzleDB();
  await db.delete(rooms).where(eq(rooms.id, roomId));
}
