const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'www');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const assets = new Set(['index.html']);

for (const match of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)=["']([^"']+)["'][^>]*>/gi)) {
  const asset = match[1];
  if (!/^(?:[a-z]+:|\/\/|#)/i.test(asset)) assets.add(asset.split(/[?#]/, 1)[0]);
}

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const asset of assets) {
  const source = path.resolve(root, asset);
  if (!source.startsWith(root + path.sep) || !fs.statSync(source).isFile()) {
    throw new Error(`Web asset bulunamadı veya geçersiz: ${asset}`);
  }
  const destination = path.join(output, asset);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}
console.log(`${assets.size} web dosyası www/ klasörüne kopyalandı.`);
