const fs = require('fs');
const path = require('path');

const SOURCE_DIR = path.join(__dirname, 'files-to-merge');
const OUTPUT_FILE = path.join(__dirname, 'tokens.json');

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] !== null &&
      typeof source[key] === 'object' &&
      !Array.isArray(source[key]) &&
      target[key] !== null &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function getNumericPrefix(filename) {
  const match = filename.match(/^(\d+)/);
  return match ? parseInt(match[1], 10) : Infinity;
}

const files = fs
  .readdirSync(SOURCE_DIR)
  .filter(f => f.endsWith('.json'))
  .sort((a, b) => getNumericPrefix(a) - getNumericPrefix(b));

if (files.length === 0) {
  console.error('No .json files found in files-to-merge/');
  process.exit(1);
}

const merged = {};

for (const file of files) {
  const filePath = path.join(SOURCE_DIR, file);
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  deepMerge(merged, content);
  console.log(`Merged: ${file}`);
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), 'utf-8');
console.log(`\nWritten to tokens.json`);
