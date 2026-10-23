const { DatabaseSync } = require('node:sqlite'); // built into Node 22.13+ (no install needed)
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.resolve(process.env.DATA_DIR || './data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const db = new DatabaseSync(path.join(DATA_DIR, 'bvf.db'));
db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');

db.exec(`
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  loc TEXT NOT NULL,
  cat TEXT NOT NULL DEFAULT 'Engagement',
  description TEXT NOT NULL DEFAULT '',
  ins TEXT NOT NULL DEFAULT '',
  link TEXT NOT NULL DEFAULT '',
  max INTEGER NOT NULL DEFAULT 0,
  vol INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','past')),
  impact TEXT NOT NULL DEFAULT '',
  img TEXT NOT NULL DEFAULT ''
);
`);

module.exports = { db, DATA_DIR, UPLOAD_DIR };
