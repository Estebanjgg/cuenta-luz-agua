const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, '..', 'public', 'icons');

// Función para crear iconos SVG
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.125)}" fill="#3b82f6"/>
  <g transform="translate(${Math.round(size * 0.125)}, ${Math.round(size * 0.125)})">
    <!-- Lightning bolt icon -->
    <path d="M${Math.round(size * 0.375)} ${Math.round(size * 0.0625)}L${Math.round(size * 0.28125)} ${Math.round(size * 0.375)}H${Math.round(size * 0.421875)}L${Math.round(size * 0.328125)} ${Math.round(size * 0.6875)}L${Math.round(size * 0.46875)} ${Math.round(size * 0.375)}H${Math.round(size * 0.328125)}L${Math.round(size * 0.375)} ${Math.round(size * 0.0625)}Z" fill="#fbbf24" stroke="#f59e0b" stroke-width="${Math.max(1, Math.round(size * 0.004))}"/>
    
    <!-- Water drop icon -->
    <path d="M${Math.round(size * 0.1875)} ${Math.round(size * 0.5)}C${Math.round(size * 0.1875)} ${Math.round(size * 0.5)} ${Math.round(size * 0.09375)} ${Math.round(size * 0.375)} ${Math.round(size * 0.09375)} ${Math.round(size * 0.25)}C${Math.round(size * 0.09375)} ${Math.round(size * 0.181)} ${Math.round(size * 0.135)} ${Math.round(size * 0.125)} ${Math.round(size * 0.1875)} ${Math.round(size * 0.125)}C${Math.round(size * 0.24)} ${Math.round(size * 0.125)} ${Math.round(size * 0.28125)} ${Math.round(size * 0.181)} ${Math.round(size * 0.28125)} ${Math.round(size * 0.25)}C${Math.round(size * 0.28125)} ${Math.round(size * 0.375)} ${Math.round(size * 0.1875)} ${Math.round(size * 0.5)} ${Math.round(size * 0.1875)} ${Math.round(size * 0.5)}Z" fill="#06b6d4" stroke="#0891b2" stroke-width="${Math.max(1, Math.round(size * 0.004))}"/>
    
    <!-- Gauge/meter background -->
    <circle cx="${Math.round(size * 0.46875)}" cy="${Math.round(size * 0.625)}" r="${Math.round(size * 0.09375)}" fill="none" stroke="#e5e7eb" stroke-width="${Math.max(2, Math.round(size * 0.006))}"/>
    <circle cx="${Math.round(size * 0.46875)}" cy="${Math.round(size * 0.625)}" r="${Math.round(size * 0.09375)}" fill="none" stroke="#10b981" stroke-width="${Math.max(2, Math.round(size * 0.006))}" stroke-dasharray="${Math.round(size * 0.589)}" stroke-dashoffset="${Math.round(size * 0.294)}" transform="rotate(-90 ${Math.round(size * 0.46875)} ${Math.round(size * 0.625)})"/>
    
    <!-- Center dot -->
    <circle cx="${Math.round(size * 0.46875)}" cy="${Math.round(size * 0.625)}" r="${Math.max(2, Math.round(size * 0.0156))}" fill="#374151"/>
    
    <!-- Text elements -->
    <text x="${Math.round(size * 0.28125)}" y="${Math.round(size * 0.75)}" font-family="Arial, sans-serif" font-size="${Math.max(8, Math.round(size * 0.047))}" font-weight="bold" fill="white" text-anchor="middle">kWh</text>
  </g>
</svg>`;
}

// Función asíncrona para generar iconos
async function generateIcons() {
  try {
    for (const size of sizes) {
      const svgContent = createSVGIcon(size);
      const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
      const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
      
      // Guardar SVG
      fs.writeFileSync(svgPath, svgContent);
      console.log(`Created ${svgPath}`);
      
      // Convertir SVG a PNG usando Sharp
      await sharp(Buffer.from(svgContent))
        .resize(size, size)
        .png()
        .toFile(pngPath);
      
      console.log(`Created ${pngPath}`);
    }
    
    console.log('\n✅ Todos los iconos han sido generados exitosamente!');
    console.log('📱 Los iconos PNG están listos para la PWA.');
    
  } catch (error) {
    console.error('❌ Error generando iconos:', error);
  }
}

// Ejecutar la función
generateIcons();