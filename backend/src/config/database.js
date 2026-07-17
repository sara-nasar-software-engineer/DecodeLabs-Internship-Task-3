const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite'); // built into Node, no install needed

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage');
const DB_PATH = path.join(STORAGE_DIR, 'urban_sips.db');
const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

const db = new DatabaseSync(DB_PATH);

db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA journal_mode = WAL;');

const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

module.exports = db;