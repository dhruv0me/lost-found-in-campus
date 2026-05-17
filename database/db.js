const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'lost_and_found.db');

let db = null;

async function initDB() {
  const SQL = await initSqlJs();

  // Load existing database or create new
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  // Create tables
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      location TEXT NOT NULL,
      date_occurred TEXT NOT NULL,
      image_url TEXT,
      poster_name TEXT NOT NULL,
      poster_email TEXT NOT NULL,
      poster_phone TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'claimed', 'resolved')),
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      claimant_name TEXT NOT NULL,
      claimant_email TEXT NOT NULL,
      claimant_phone TEXT,
      proof_description TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected')),
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
    )
  `);

  // Create indexes (ignore errors if they exist)
  const indexes = [
    'CREATE INDEX IF NOT EXISTS idx_items_type ON items(type)',
    'CREATE INDEX IF NOT EXISTS idx_items_category ON items(category)',
    'CREATE INDEX IF NOT EXISTS idx_items_location ON items(location)',
    'CREATE INDEX IF NOT EXISTS idx_items_status ON items(status)',
    'CREATE INDEX IF NOT EXISTS idx_items_created ON items(created_at)',
    'CREATE INDEX IF NOT EXISTS idx_items_poster_email ON items(poster_email)',
    'CREATE INDEX IF NOT EXISTS idx_claims_item_id ON claims(item_id)'
  ];
  indexes.forEach(sql => { try { db.run(sql); } catch(e) {} });

  saveDB();
  console.log('✅ Database initialized');
  return db;
}

function saveDB() {
  if (!db) return;
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDB() {
  return db;
}

// Helper: run a query and return all rows as array of objects
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

// Helper: run a query and return first row as object
function queryOne(sql, params = []) {
  const results = queryAll(sql, params);
  return results.length > 0 ? results[0] : null;
}

// Helper: run an insert/update/delete
function execute(sql, params = []) {
  db.run(sql, params);
  saveDB();
}

module.exports = { initDB, getDB, queryAll, queryOne, execute, saveDB };
