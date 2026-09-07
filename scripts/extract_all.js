const fs = require('fs');
const code = fs.readFileSync('index-bundle.js', 'utf8');

const output = {};

// Helper to find slice around a phrase
function findContext(phrase, before = 100, after = 1500) {
  const idx = code.indexOf(phrase);
  if (idx === -1) return null;
  return code.substring(Math.max(0, idx - before), Math.min(code.length, idx + after));
}

// 1. Navigation
const navStart = code.indexOf('name:"Home",href:"/"');
if (navStart !== -1) {
  const arrStart = code.lastIndexOf('[', navStart);
  const arrEnd = code.indexOf(']', navStart) + 1;
  output.navigation = code.substring(arrStart, arrEnd);
}

// 2. Services Homepage Preview
const srvStart = code.indexOf('Custom Software');
if (srvStart !== -1) {
  output.servicesHome = findContext('Custom Software', 100, 1000);
}

// 3. Workshop Specializations (9 items)
const wsStart = code.indexOf('Web/App Dev');
if (wsStart !== -1) {
  output.workshops = findContext('Web/App Dev', 100, 1500);
}

// 4. Testimonials
const testStart = code.indexOf('What Our Community Says');
if (testStart !== -1) {
  output.testimonials = findContext('What Our Community Says', 50, 1500);
}

// 5. Products
const prodStart = code.indexOf('EduFlow LMS');
if (prodStart !== -1) {
  output.products = findContext('EduFlow LMS', 100, 1200);
}

// 6. Events
const evtStart = code.indexOf('Upcoming Events');
if (evtStart !== -1) {
  output.events = findContext('Upcoming Events', 50, 2000);
}

// 7. Careers & Jobs
const jobStart = code.indexOf('Why Join Innovex');
if (jobStart !== -1) {
  output.careers = findContext('Why Join Innovex', 50, 2500);
}

// 8. Internships
const internStart = code.indexOf('Frontend Developer Intern');
if (internStart !== -1) {
  output.internships = findContext('Frontend Developer Intern', 100, 2000);
}

// 9. Contact
const contStart = code.indexOf('info@innovexarena.in');
if (contStart !== -1) {
  output.contact = findContext('info@innovexarena.in', 100, 1200);
}

// 10. Admin
const admStart = code.indexOf('Admin Login');
if (admStart !== -1) {
  output.admin = findContext('Admin Login', 50, 1200);
}

fs.writeFileSync('extracted_full_site.json', JSON.stringify(output, null, 2));
console.log('Successfully extracted full site content into extracted_full_site.json');
