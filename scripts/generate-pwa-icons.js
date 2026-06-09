/**
 * Script para generar iconos PWA desde una imagen fuente
 *
 * Uso:
 *   1. Instalar dependencias: npm install sharp
 *   2. Colocar tu imagen fuente como "public/icon-source.png" (minimo 1024x1024)
 *   3. Ejecutar: node scripts/generate-pwa-icons.js
 *
 * Genera:
 *   - Iconos en /public/icons/ (todas las tamanos requeridas)
 *   - Iconos maskable y rounded en /public/
 */

const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const SIZES = [48, 72, 96, 128, 144, 152, 192, 256, 384, 512];
const SOURCE = path.join(__dirname, '..', 'public', 'icon-source.png');
const ICONS_DIR = path.join(__dirname, '..', 'public', 'icons');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

const MASKABLE_PADDING = 0.1; // 10% padding for maskable icons

async function generateIcons() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`Error: No se encontro ${SOURCE}`);
    console.error('Coloca tu imagen fuente (minimo 1024x1024) como "public/icon-source.png"');
    process.exit(1);
  }

  if (!fs.existsSync(ICONS_DIR)) {
    fs.mkdirSync(ICONS_DIR, { recursive: true });
  }

  console.log('Generando iconos PWA...\n');

  // Generate standard icons
  for (const size of SIZES) {
    const outputPath = path.join(ICONS_DIR, `icon-${size}x${size}.png`);
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(outputPath);
    console.log(`  [OK] icon-${size}x${size}.png`);
  }

  // Generate maskable icon (512x512 with padding)
  const maskableSize = 512;
  const padding = Math.floor(maskableSize * MASKABLE_PADDING);
  const innerSize = maskableSize - padding * 2;

  const resizedInner = await sharp(SOURCE)
    .resize(innerSize, innerSize, { fit: 'cover' })
    .toBuffer();

  await sharp({
    create: {
      width: maskableSize,
      height: maskableSize,
      channels: 4,
      background: { r: 11, g: 17, b: 32, alpha: 1 }
    }
  })
    .composite([{
      input: resizedInner,
      top: padding,
      left: padding
    }])
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon512_maskable.png'));
  console.log('  [OK] icon512_maskable.png (maskable)');

  // Generate rounded icon (512x512)
  await sharp(SOURCE)
    .resize(512, 512, { fit: 'cover' })
    .png()
    .toFile(path.join(PUBLIC_DIR, 'icon512_rounded.png'));
  console.log('  [OK] icon512_rounded.png');

  // Generate Apple touch icons
  const appleSizes = [120, 152, 167, 180];
  for (const size of appleSizes) {
    const outputPath = path.join(ICONS_DIR, `apple-touch-icon-${size}x${size}.png`);
    await sharp(SOURCE)
      .resize(size, size, { fit: 'cover' })
      .png()
      .toFile(outputPath);
    console.log(`  [OK] apple-touch-icon-${size}x${size}.png`);
  }

  // Generate favicon.ico (multi-size)
  const faviconSizes = [16, 32, 48];
  const faviconBuffers = await Promise.all(
    faviconSizes.map(size =>
      sharp(SOURCE).resize(size, size, { fit: 'cover' }).png().toBuffer()
    )
  );

  // Write individual favicon sizes and combine
  for (let i = 0; i < faviconSizes.length; i++) {
    await sharp(faviconBuffers[i])
      .toFile(path.join(PUBLIC_DIR, `favicon-${faviconSizes[i]}x${faviconSizes[i]}.png`));
  }

  // For favicon.ico, we use the 48x48 as base (browsers handle multi-size ICO differently now)
  await sharp(faviconBuffers[2])
    .toFile(path.join(PUBLIC_DIR, 'favicon.ico'));
  console.log('  [OK] favicon.ico');

  console.log('\nIconos generados exitosamente!');
  console.log(`\nSiguiente paso: revisa la carpeta public/icons/ y public/ para verificar los iconos.`);
}

generateIcons().catch(err => {
  console.error('Error generando iconos:', err);
  process.exit(1);
});
