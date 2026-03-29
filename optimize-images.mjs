import sharp from 'sharp';
import { readdir, stat, mkdir } from 'fs/promises';
import { join, extname, relative } from 'path';

const SRC = 'src/images';
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 80;
const PNG_QUALITY = 80;

// Folders/files to skip (schetsen and logos should stay as PNG)
const SKIP_PATTERNS = ['schetsen', 'logo'];

async function getFiles(dir) {
    const entries = await readdir(dir, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...await getFiles(fullPath));
        } else {
            const ext = extname(entry.name).toLowerCase();
            if (['.jpg', '.jpeg', '.png'].includes(ext)) {
                files.push(fullPath);
            }
        }
    }
    return files;
}

async function optimizeImage(filePath) {
    const rel = relative(SRC, filePath);

    // Skip schetsen and logos
    if (SKIP_PATTERNS.some(p => rel.toLowerCase().includes(p))) {
        // Still resize if very large
        const metadata = await sharp(filePath).metadata();
        if (metadata.width > 2000) {
            const fileSize = (await stat(filePath)).size;
            const img = sharp(filePath).resize(2000, null, { withoutEnlargement: true });
            if (extname(filePath).toLowerCase() === '.png') {
                await img.png({ quality: PNG_QUALITY }).toBuffer()
                    .then(buf => {
                        if (buf.length < fileSize) {
                            return sharp(filePath).resize(2000, null, { withoutEnlargement: true })
                                .png({ quality: PNG_QUALITY }).toFile(filePath + '.tmp');
                        }
                    });
                try {
                    const { rename } = await import('fs/promises');
                    await rename(filePath + '.tmp', filePath);
                    const newSize = (await stat(filePath)).size;
                    console.log(`  [schets] ${rel}: ${(fileSize/1024/1024).toFixed(1)}MB -> ${(newSize/1024/1024).toFixed(1)}MB`);
                } catch(e) {}
            }
        }
        return;
    }

    const fileSize = (await stat(filePath)).size;
    const sizeMB = fileSize / 1024 / 1024;

    // Skip small files
    if (sizeMB < 0.3) return;

    try {
        const metadata = await sharp(filePath).metadata();
        const ext = extname(filePath).toLowerCase();

        let pipeline = sharp(filePath)
            .resize(MAX_WIDTH, null, { withoutEnlargement: true });

        if (ext === '.png' && !rel.includes('logo')) {
            // Convert photo PNGs to JPEG (much smaller)
            const newPath = filePath.replace(/\.png$/i, '.jpg');
            await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(newPath + '.tmp');

            // Replace original
            const { rename, unlink } = await import('fs/promises');
            if (newPath !== filePath) {
                await unlink(filePath);
            }
            await rename(newPath + '.tmp', newPath);
            const newSize = (await stat(newPath)).size;
            console.log(`  ${rel}: ${sizeMB.toFixed(1)}MB -> ${(newSize/1024/1024).toFixed(1)}MB (-> jpg)`);
        } else {
            await pipeline.jpeg({ quality: JPEG_QUALITY, mozjpeg: true }).toFile(filePath + '.tmp');
            const { rename } = await import('fs/promises');
            await rename(filePath + '.tmp', filePath);
            const newSize = (await stat(filePath)).size;
            console.log(`  ${rel}: ${sizeMB.toFixed(1)}MB -> ${(newSize/1024/1024).toFixed(1)}MB`);
        }
    } catch (e) {
        console.error(`  FOUT bij ${rel}: ${e.message}`);
    }
}

console.log('Afbeeldingen optimaliseren...\n');
const files = await getFiles(SRC);
console.log(`${files.length} afbeeldingen gevonden\n`);

for (const file of files) {
    await optimizeImage(file);
}

console.log('\nKlaar!');
