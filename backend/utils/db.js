const fs = require('fs');
const path = require('path');

// Small helper module that treats a JSON file like a mini "table".
// Every route file calls readData()/writeData() instead of touching
// the filesystem directly — keeps the storage logic in one place so
// it would be easy to swap for a real database later.

function filePath(fileName) {
  return path.join(__dirname, '..', 'data', fileName);
}

function readData(fileName) {
  const fullPath = filePath(fileName);
  try {
    const raw = fs.readFileSync(fullPath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error(`Failed to read ${fileName}:`, err.message);
    return [];
  }
}

function writeData(fileName, data) {
  const fullPath = filePath(fileName);
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2), 'utf-8');
}

module.exports = { readData, writeData };