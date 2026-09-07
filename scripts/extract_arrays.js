const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

function extractArrayAround(keyword) {
  const idx = code.indexOf(keyword);
  if (idx === -1) return null;
  const start = code.lastIndexOf('[', idx);
  // find matching bracket
  let depth = 0;
  for (let i = start; i < code.length; i++) {
    if (code[i] === '[') depth++;
    else if (code[i] === ']') {
      depth--;
      if (depth === 0) {
        return code.substring(start, i + 1);
      }
    }
  }
  return null;
}

console.log('=== TESTIMONIALS ===');
console.log(extractArrayAround('Rahul Sharma') || extractArrayAround('What Our Community Says'));

console.log('=== PRODUCTS ===');
console.log(extractArrayAround('EduFlow LMS'));

console.log('=== EVENTS ===');
console.log(extractArrayAround('AI & Cloud Summit') || extractArrayAround('Upcoming Events'));

console.log('=== WHY JOIN US PERKS ===');
console.log(extractArrayAround('Real-World Impact'));

console.log('=== OPEN JOBS ===');
console.log(extractArrayAround('Backend Developer'));

console.log('=== OPEN INTERNSHIPS ===');
console.log(extractArrayAround('Frontend Developer Intern'));

console.log('=== CORE SERVICES HOME ===');
console.log(extractArrayAround('Custom Software'));
