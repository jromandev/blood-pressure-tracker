const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes for iOS
const iconSizes = [
  { size: 20, scale: 2, name: 'Icon-App-20x20@2x.png' },
  { size: 20, scale: 3, name: 'Icon-App-20x20@3x.png' },
  { size: 29, scale: 2, name: 'Icon-App-29x29@2x.png' },
  { size: 29, scale: 3, name: 'Icon-App-29x29@3x.png' },
  { size: 40, scale: 2, name: 'Icon-App-40x40@2x.png' },
  { size: 40, scale: 3, name: 'Icon-App-40x40@3x.png' },
  { size: 60, scale: 2, name: 'Icon-App-60x60@2x.png' },
  { size: 60, scale: 3, name: 'Icon-App-60x60@3x.png' },
  { size: 76, scale: 2, name: 'Icon-App-76x76@2x.png' },
  { size: 83.5, scale: 2, name: 'Icon-App-83.5x83.5@2x.png' },
  { size: 1024, scale: 1, name: 'Icon-App-1024x1024@1x.png' }
];

const splashSizes = [
  { width: 2048, height: 2732, name: 'splash-2048x2732.png' }, // iPad Pro 12.9"
  { width: 1668, height: 2388, name: 'splash-1668x2388.png' }, // iPad Pro 11"
  { width: 1536, height: 2048, name: 'splash-1536x2048.png' }, // iPad
  { width: 1242, height: 2688, name: 'splash-1242x2688.png' }, // iPhone 11 Pro Max, XS Max
  { width: 1125, height: 2436, name: 'splash-1125x2436.png' }, // iPhone X, XS, 11 Pro
  { width: 828, height: 1792, name: 'splash-828x1792.png' },   // iPhone XR, 11
  { width: 1242, height: 2208, name: 'splash-1242x2208.png' }, // iPhone 8 Plus
  { width: 750, height: 1334, name: 'splash-750x1334.png' },   // iPhone 8
  { width: 640, height: 1136, name: 'splash-640x1136.png' }    // iPhone SE
];

async function generateIcons() {
  const iconDir = path.join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'AppIcon.appiconset');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(iconDir)) {
    fs.mkdirSync(iconDir, { recursive: true });
  }

  console.log('Generating iOS app icons...');
  
  for (const icon of iconSizes) {
    const size = Math.round(icon.size * icon.scale);
    
    // For the 1024x1024 icon, ensure no transparency
    if (size === 1024) {
      await sharp('app-icon-base.svg')
        .resize(size, size)
        .flatten({ background: '#6366f1' }) // Remove alpha channel with solid background
        .png()
        .toFile(path.join(iconDir, icon.name));
    } else {
      await sharp('app-icon-base.svg')
        .resize(size, size)
        .png()
        .toFile(path.join(iconDir, icon.name));
    }
    console.log(`✓ Created ${icon.name} (${size}x${size})`);
  }

  // Generate Contents.json for AppIcon
  const contentsJson = {
    images: [
      { size: '20x20', idiom: 'iphone', filename: 'Icon-App-20x20@2x.png', scale: '2x' },
      { size: '20x20', idiom: 'iphone', filename: 'Icon-App-20x20@3x.png', scale: '3x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-App-29x29@2x.png', scale: '2x' },
      { size: '29x29', idiom: 'iphone', filename: 'Icon-App-29x29@3x.png', scale: '3x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-App-40x40@2x.png', scale: '2x' },
      { size: '40x40', idiom: 'iphone', filename: 'Icon-App-40x40@3x.png', scale: '3x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-App-60x60@2x.png', scale: '2x' },
      { size: '60x60', idiom: 'iphone', filename: 'Icon-App-60x60@3x.png', scale: '3x' },
      { size: '76x76', idiom: 'ipad', filename: 'Icon-App-76x76@2x.png', scale: '2x' },
      { size: '83.5x83.5', idiom: 'ipad', filename: 'Icon-App-83.5x83.5@2x.png', scale: '2x' },
      { size: '1024x1024', idiom: 'ios-marketing', filename: 'Icon-App-1024x1024@1x.png', scale: '1x' }
    ],
    info: { version: 1, author: 'xcode' }
  };

  fs.writeFileSync(
    path.join(iconDir, 'Contents.json'),
    JSON.stringify(contentsJson, null, 2)
  );
  console.log('✓ Created Contents.json for AppIcon');
}

async function generateSplashScreens() {
  const splashDir = path.join(__dirname, 'ios', 'App', 'App', 'Assets.xcassets', 'Splash.imageset');
  
  // Create directory if it doesn't exist
  if (!fs.existsSync(splashDir)) {
    fs.mkdirSync(splashDir, { recursive: true });
  }

  console.log('\nGenerating splash screens...');
  
  for (const splash of splashSizes) {
    await sharp('splash-base.svg')
      .resize(splash.width, splash.height, {
        fit: 'fill',
        background: { r: 99, g: 102, b: 241, alpha: 1 }
      })
      .png()
      .toFile(path.join(splashDir, splash.name));
    console.log(`✓ Created ${splash.name}`);
  }

  // Generate default splash - use largest size
  await sharp('splash-base.svg')
    .resize(2732, 2732, {
      fit: 'fill',
      background: { r: 99, g: 102, b: 241, alpha: 1 }
    })
    .png()
    .toFile(path.join(splashDir, 'splash.png'));

  // Generate Contents.json for Splash
  const splashContentsJson = {
    images: [
      { idiom: 'universal', filename: 'splash.png', scale: '1x' },
      { idiom: 'universal', scale: '2x' },
      { idiom: 'universal', scale: '3x' }
    ],
    info: { version: 1, author: 'xcode' }
  };

  fs.writeFileSync(
    path.join(splashDir, 'Contents.json'),
    JSON.stringify(splashContentsJson, null, 2)
  );
  console.log('✓ Created Contents.json for Splash');
}

async function main() {
  try {
    await generateIcons();
    await generateSplashScreens();
    console.log('\n✅ All icons and splash screens generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Open Xcode: npx cap open ios');
    console.log('2. Verify assets in Assets.xcassets');
    console.log('3. Build and run the app');
  } catch (error) {
    console.error('Error generating assets:', error);
    process.exit(1);
  }
}

main();
