const fs = require('fs');
const path = require('path');

const versionFilePath = path.resolve(__dirname, '..', 'src/version.json');

// Read the version file
const versionData = JSON.parse(fs.readFileSync(versionFilePath, 'utf8'));
let [major, minor, patch] = versionData.version.split('.').map(Number);

// Increment the patch version (or change to minor/major if needed)
patch++;
if (patch >= 256) { minor++; patch = 0; }
if (minor >= 256) { major++; minor = 0; }

// Update the version data
versionData.version = `${major}.${minor}.${patch}`;

// Write the updated version back to the file
fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

console.log(`Updated version to ${versionData.version}`);
