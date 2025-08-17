const fs = require('fs');
const path = require('path');

// Path to the built OverType library
const overtypeMinPath = path.join(__dirname, '../../dist/overtype.min.js');
const mediaDir = path.join(__dirname, '../media');
const targetPath = path.join(mediaDir, 'overtype.min.js');

// Create media directory if it doesn't exist
if (!fs.existsSync(mediaDir)) {
    fs.mkdirSync(mediaDir, { recursive: true });
}

// Check if OverType build exists
if (!fs.existsSync(overtypeMinPath)) {
    console.error('❌ OverType build not found. Please run "npm run build" in the main directory first.');
    process.exit(1);
}

try {
    // Copy the OverType library to the extension's media directory
    fs.copyFileSync(overtypeMinPath, targetPath);
    console.log('✅ OverType library bundled successfully');
    
    // Get file size for verification
    const stats = fs.statSync(targetPath);
    console.log(`📦 Bundle size: ${(stats.size / 1024).toFixed(2)} KB`);
} catch (error) {
    console.error('❌ Failed to bundle OverType library:', error);
    process.exit(1);
}