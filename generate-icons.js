// Node.js script to generate Android app icons from AppIcon.png
const fs = require('fs');
const path = require('path');

// Try to use sharp if available, otherwise provide instructions
let sharp;
try {
  sharp = require('sharp');
} catch (e) {
  console.log('⚠️  Sharp not installed. Installing sharp...');
  console.log('Please run: npm install --save-dev sharp');
  process.exit(1);
}

const sourceLogo = path.join(__dirname, 'src', 'assets', 'AppIcon.png');
const basePath = path.join(__dirname, 'android', 'app', 'src', 'main', 'res');

// Icon sizes for different densities
const iconSizes = {
  'mipmap-mdpi': 48,
  'mipmap-hdpi': 72,
  'mipmap-xhdpi': 96,
  'mipmap-xxhdpi': 144,
  'mipmap-xxxhdpi': 192,
};

async function generateIcons() {
  console.log('🎨 Generating Android app icons from AppIcon.png...\n');

  // Check if source logo exists
  if (!fs.existsSync(sourceLogo)) {
    console.error(`❌ Error: Source logo not found at ${sourceLogo}`);
    process.exit(1);
  }

  // Generate icons for each density
  for (const [density, size] of Object.entries(iconSizes)) {
    const dir = path.join(basePath, density);

    // Create directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Generate square icon
    const squareIcon = path.join(dir, 'ic_launcher.png');
    console.log(`  📱 Generating ${density} icon (${size}x${size})...`);
    
    try {
      await sharp(sourceLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .extend({
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(squareIcon);

      // Generate round icon (same as square, Android handles rounding)
      const roundIcon = path.join(dir, 'ic_launcher_round.png');
      console.log(`  🔵 Generating ${density} round icon...`);
      
      await sharp(sourceLogo)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .extend({
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: { r: 0, g: 0, b: 0, alpha: 0 }
        })
        .toFile(roundIcon);
    } catch (error) {
      console.error(`  ❌ Error generating ${density} icons:`, error.message);
    }
  }

  console.log('\n✅ All icons generated successfully!');
  console.log(`📦 Icons are ready in: ${basePath}`);
}

generateIcons().catch(console.error);
