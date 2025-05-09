const fs = require('fs');
const path = require('path');

// After running npm run build, this script modifies the output for Itch.io compatibility

// Path to build directory
const buildDir = path.join(__dirname, 'build');

// Fix index.html to use relative paths instead of absolute
const indexPath = path.join(buildDir, 'index.html');
let indexHtml = fs.readFileSync(indexPath, 'utf8');

// Replace absolute paths with relative paths (remove leading slashes)
indexHtml = indexHtml.replace(/href="\//g, 'href="');
indexHtml = indexHtml.replace(/src="\//g, 'src="');

// Write the modified index.html
fs.writeFileSync(indexPath, indexHtml);

// Fix manifest.json to remove unsupported features
const manifestPath = path.join(buildDir, 'manifest.json');
if (fs.existsSync(manifestPath)) {
  let manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  
  // Remove potentially problematic fields
  delete manifest.monetization;
  delete manifest.xr;
  
  // Write the modified manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log('Modified manifest.json to remove unsupported features');
}

console.log('Build has been prepared for Itch.io!');
