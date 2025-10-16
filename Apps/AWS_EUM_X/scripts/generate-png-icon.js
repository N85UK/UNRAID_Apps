#!/usr/bin/env node

/**
 * Generate PNG icon from SVG
 * 
 * This script converts the aws-eum-x.svg icon to a 512x512 PNG
 * for use in Community Apps and other contexts requiring raster images.
 * 
 * Requirements:
 *   npm install sharp
 * 
 * Usage:
 *   node scripts/generate-png-icon.js
 */

const fs = require('fs');
const path = require('path');

// Check if sharp is available
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.error('❌ Error: sharp is not installed');
  console.error('📦 Install it with: npm install --save-dev sharp');
  console.error('');
  console.error('Alternatively, use an online converter:');
  console.error('  • https://cloudconvert.com/svg-to-png');
  console.error('  • https://convertio.co/svg-png/');
  console.error('  • Upload icons/aws-eum-x.svg');
  console.error('  • Set dimensions to 512x512');
  console.error('  • Download as icons/aws-eum-x.png');
  process.exit(1);
}

const svgPath = path.join(__dirname, '../icons/aws-eum-x.svg');
const pngPath = path.join(__dirname, '../icons/aws-eum-x.png');

async function generatePNG() {
  try {
    console.log('🎨 Converting SVG to PNG...');
    console.log(`   Source: ${svgPath}`);
    console.log(`   Target: ${pngPath}`);
    
    // Read SVG file
    if (!fs.existsSync(svgPath)) {
      throw new Error(`SVG file not found: ${svgPath}`);
    }
    
    const svgBuffer = fs.readFileSync(svgPath);
    
    // Convert to PNG with sharp
    await sharp(svgBuffer, { density: 300 })
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
      })
      .png({
        compressionLevel: 9,
        quality: 100
      })
      .toFile(pngPath);
    
    // Get file size
    const stats = fs.statSync(pngPath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log('✅ PNG icon generated successfully!');
    console.log(`   Size: ${sizeKB} KB`);
    console.log(`   Dimensions: 512x512`);
    console.log(`   Path: ${pngPath}`);
    
  } catch (error) {
    console.error('❌ Error generating PNG:', error.message);
    console.error('');
    console.error('💡 Manual conversion options:');
    console.error('   1. Install ImageMagick:');
    console.error('      convert icons/aws-eum-x.svg -resize 512x512 icons/aws-eum-x.png');
    console.error('');
    console.error('   2. Use Inkscape:');
    console.error('      inkscape icons/aws-eum-x.svg --export-type=png -w 512 -h 512 -o icons/aws-eum-x.png');
    console.error('');
    console.error('   3. Online converter (recommended for this environment):');
    console.error('      • Upload icons/aws-eum-x.svg to https://cloudconvert.com/svg-to-png');
    console.error('      • Set width/height to 512');
    console.error('      • Download and save as icons/aws-eum-x.png');
    
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  generatePNG();
}

module.exports = { generatePNG };
