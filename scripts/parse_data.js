const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

// Let's extract specific data variables directly
// 1. Navigation items
console.log('--- 1. NAVIGATION ITEMS ---');
const navRegex = /\[\{name:\"[^\"]+\",href:\"[^\"]+\"\}\]/;
const navMatch = code.match(/\[\{name:\"Home\",href:\"\/\"\}[\s\S]*?\]/);
if (navMatch) console.log(navMatch[0]);

// 2. Vision & Mission
console.log('\n--- 2. HERO, VISION & MISSION ---');
console.log('Hero Badge: 🚀 Fueling the Future of Creators');
console.log('Hero Headline: Pioneering AI & Cloud Innovations');
console.log('Hero Subtitle: Empowering students, developers, and businesses with cutting-edge technology solutions, hands-on workshops, and transformative hackathons.');
console.log('Vision: To become a global innovation hub that builds intelligent and scalable technology solutions using Artificial Intelligence, Cloud Computing, and emerging technologies — empowering industries and individuals to create a smarter, connected future.');
console.log('Mission points:');
console.log('1. Build next-generation AI and cloud-based products');
console.log('2. Provide hands-on learning in trending technologies');
console.log('3. Bridge the gap between academia and industry');
console.log('4. Foster an ecosystem of continuous innovation');

// 3. Core Services on Home
console.log('\n--- 3. SERVICES (HOME & PAGE) ---');
const servMatch = code.match(/\[\{icon:[^,]+,title:\"Custom Software & AI Solutions\"[\s\S]*?\}\]/);
if (servMatch) console.log(servMatch[0]);

// 4. Workshops (9 items)
const wsMatch = code.match(/\[\{icon:[^,]+,title:\"Web\/App Dev\"[\s\S]*?\}\]/);
if (wsMatch) console.log(wsMatch[0]);

// 5. Testimonials
const testMatch = code.match(/\[\{name:\"Rahul Sharma\"[\s\S]*?\}\]/);
if (testMatch) console.log(testMatch[0]);

// 6. Products
const prodMatch = code.match(/\[\{id:\"eduflow-lms\"[\s\S]*?\}\]/);
if (prodMatch) console.log(prodMatch[0]);

// 7. Events
const evtMatch = code.match(/\[\{id:\"[^\"]+\",title:\"AI & Cloud Summit 2024\"[\s\S]*?\}\]/);
if (evtMatch) console.log(evtMatch[0]);

// 8. Why Join Us (Careers perks)
const perkMatch = code.match(/\[\{icon:[^,]+,title:\"Real-World Impact\"[\s\S]*?\}\]/);
if (perkMatch) console.log(perkMatch[0]);

// 9. Jobs
const jobMatch = code.match(/\[\{id:\"[^\"]+\",title:\"Backend Developer\"[\s\S]*?\}\]/);
if (jobMatch) console.log(jobMatch[0]);

// 10. Internships
const internMatch = code.match(/\[\{id:\"[^\"]+\",title:\"Frontend Developer Intern\"[\s\S]*?\}\]/);
if (internMatch) console.log(internMatch[0]);
