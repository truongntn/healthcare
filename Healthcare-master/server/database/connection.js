import knex from 'knex';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let db = null;

const config = {
  client: 'sqlite3',
  connection: {
    filename: process.env.NODE_ENV === 'test' 
      ? ':memory:' 
      : join(__dirname, '../../data/intellihealth.db')
  },
  useNullAsDefault: true,
  migrations: {
    directory: join(__dirname, 'migrations')
  },
  seeds: {
    directory: join(__dirname, 'seeds')
  }
};

export async function getDb() {
  if (!db) {
    db = knex(config);
  }
  return db;
}

export async function initDatabase() {
  const database = await getDb();
  
  // Ensure data directory exists
  if (process.env.NODE_ENV !== 'test') {
    const dataDir = join(__dirname, '../../data');
    try {
      await fs.mkdir(dataDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }
  }

  // Run migrations
  await database.migrate.latest();
  
  return database;
}

export async function closeDb() {
  if (db) {
    await db.destroy();
    db = null;
  }
}