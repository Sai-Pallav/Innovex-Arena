const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

// Search for supabase table queries: .from("...")
const fromRegex = /\.from\([\"']([^\"']+)[\"']\)/g;
let match;
const tables = new Set();
while ((match = fromRegex.exec(code)) !== null) {
  tables.add(match[1]);
}

console.log('Supabase tables used:', Array.from(tables));

// Search for all strings that define sections or features
tables.forEach(table => {
  const idx = code.indexOf(`"${table}"`);
  console.log(`\n--- Code around table "${table}" ---`);
  console.log(code.substring(Math.max(0, idx - 150), Math.min(code.length, idx + 400)));
});
