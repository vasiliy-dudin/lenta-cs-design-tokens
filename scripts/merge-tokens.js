import fs from 'fs';

const SOURCE_DIR = new URL('../src/', import.meta.url);
const OUTPUT_FILE = new URL('../dist/tokens.json', import.meta.url);

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
  console.error('No .json files found in src/');
  process.exit(1);
}

const merged = {};

for (const file of files) {
  const fileUrl = new URL(file, SOURCE_DIR);
  const content = JSON.parse(fs.readFileSync(fileUrl, 'utf-8'));
  deepMerge(merged, content);
  console.log(`Merged: ${file}`);
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(merged, null, 2), 'utf-8');
console.log(`\nWritten to dist/tokens.json`);
