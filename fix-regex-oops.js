const fs = require('fs');
const path = require('path');

const tsFile = path.join('frontend-site', 'src', 'app', 'features', 'about-me', 'about-me.component.ts');
let tsContent = fs.readFileSync(tsFile, 'utf8');

// I noticed the regex for isValidEmail in about-me was mutated: /^[^s@]+@[^s@]+.[^s@]+$/
// It missed the \ character probably due to string escaping issues when I generated the file earlier
tsContent = tsContent.replace(/return \/\^\[\^s@\]\+@\[\^s@\]\+\.\[\^s@\]\+\$\/\.test\(email\);/, 'return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);');

fs.writeFileSync(tsFile, tsContent, 'utf8');
