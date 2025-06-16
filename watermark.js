// watermark.js
import sharp from "sharp";

export async function addWatermark(inputBuffer, logoPath, ratio = 0.25) {
  const metadata = await sharp(inputBuffer).metadata();
  const watermarkWidth = Math.round(metadata.width * ratio);

  const watermarkBuffer = await sharp(logoPath)
    .resize({ width: watermarkWidth })
    .toBuffer();

  const watermarked = await sharp(inputBuffer)
    .composite([
      {
        input: watermarkBuffer,
        gravity: "southeast",
      },
    ])
    .png()
    .toBuffer();

  return watermarked;
}
