// Script para quitar el fondo blanco de una imagen PNG
// Necesitas instalar: npm install sharp

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function removeWhiteBackground() {
  const inputPath = './assets/images/logo.png';
  const outputPath = './assets/images/logo-transparent.png';
  
  try {
    // Verificar que el archivo existe
    if (!fs.existsSync(inputPath)) {
      console.log('❌ No se encontró el archivo logo.png en assets/images/');
      return;
    }

    console.log('🔄 Procesando imagen...');
    
    // Procesar la imagen para quitar el fondo blanco
    await sharp(inputPath)
      .png({ 
        quality: 100,
        compressionLevel: 0,
        palette: true
      })
      .removeAlpha() // Quitar canal alpha existente
      .ensureAlpha() // Agregar nuevo canal alpha
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        // Convertir píxeles blancos a transparentes
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Si el píxel es blanco o casi blanco, hacerlo transparente
          if (r > 240 && g > 240 && b > 240) {
            data[i + 3] = 0; // Alpha = 0 (transparente)
          }
        }
        
        return sharp(data, {
          raw: {
            width: info.width,
            height: info.height,
            channels: 4
          }
        }).png().toFile(outputPath);
      });

    console.log('✅ Imagen procesada exitosamente!');
    console.log(`📁 Nueva imagen guardada como: ${outputPath}`);
    console.log('💡 Ahora actualiza tu código para usar "logo-transparent.png"');
    
  } catch (error) {
    console.error('❌ Error al procesar la imagen:', error.message);
    console.log('\n💡 Alternativas:');
    console.log('1. Usa una herramienta online: remove.bg');
    console.log('2. Edita la imagen en Photoshop/GIMP');
    console.log('3. Usa ImageMagick: convert logo.png -transparent white logo-transparent.png');
  }
}

// Ejecutar solo si sharp está disponible
try {
  removeWhiteBackground();
} catch (error) {
  console.log('⚠️  Para usar este script, instala sharp:');
  console.log('npm install sharp');
  console.log('\n💡 Alternativas rápidas:');
  console.log('1. Online: https://remove.bg');
  console.log('2. ImageMagick: convert logo.png -transparent white logo-transparent.png');
}
