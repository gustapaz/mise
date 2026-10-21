import sharp from 'sharp';
import { readdir, unlink } from 'node:fs/promises';
for (const file of (await readdir('public/images')).filter((f) => f.endsWith('.jpg'))) {
  for (const width of [400, 600, 1200])
    await sharp(`public/images/${file}`)
      .resize(width, (width * 3) / 4, { fit: 'cover' })
      .webp({ quality: 82 })
      .toFile(`public/images/${file.slice(0, -4)}-${width}.webp`);
  await unlink(`public/images/${file}`);
}
