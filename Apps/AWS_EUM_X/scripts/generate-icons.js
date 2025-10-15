const fs = require('fs');
const path = require('path');

const base64Path = path.join(__dirname, '..', 'icons', 'icon-512.base64');
const outPath = path.join(__dirname, '..', 'icons', 'icon-512.png');

if (!fs.existsSync(base64Path)) {
  console.log('No base64 icon file found; skipping generation.');
  process.exit(0);
}

const data = fs.readFileSync(base64Path, 'utf8').trim();
const buf = Buffer.from(data, 'base64');
fs.writeFileSync(outPath, buf);
console.log('Generated', outPath);
