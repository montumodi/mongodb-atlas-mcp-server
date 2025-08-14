#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read package.json to get the current version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
const newVersion = packageJson.version;

// Update version in src/index.js
const indexJsPath = path.join(__dirname, '..', 'src', 'index.js');
let indexJsContent = fs.readFileSync(indexJsPath, 'utf8');

// Replace the version in the Server constructor
const versionRegex = /version: ['"][\d.]+['"]/;
indexJsContent = indexJsContent.replace(versionRegex, `version: '${newVersion}'`);

// Write the updated content back to index.js
fs.writeFileSync(indexJsPath, indexJsContent, 'utf8');

console.log(`Updated version to ${newVersion} in src/index.js`);