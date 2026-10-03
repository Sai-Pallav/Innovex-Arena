const fs = require('fs');
const path = require('path');

// Basic file size check and visual presence check
const dir = path.join(__dirname, 'p3_screenshots');
const files = fs.readdirSync(dir);
console.log('Available screenshots in', dir, ':');
files.forEach(f => {
  const stat = fs.statSync(path.join(dir, f));
  console.log(`  ${f}: ${stat.size} bytes`);
});
