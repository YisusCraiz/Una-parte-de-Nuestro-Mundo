// Rasterización del icono vectorial propio; no modifica la imagen de referencia.
const fs=require('node:fs/promises'),path=require('node:path');
const sharp=require('sharp');
(async()=>{const root=path.resolve(__dirname,'../assets/icons'),svg=await fs.readFile(path.join(root,'icon.svg'));for(const [name,size]of [['icon-192.png',192],['icon-512.png',512],['icon-maskable-512.png',512],['apple-touch-icon.png',180]])await sharp(svg).resize(size,size).png().toFile(path.join(root,name));console.log('Iconos creados: 192, 512, maskable 512 y Apple 180.')})().catch(e=>{console.error(e);process.exitCode=1});
