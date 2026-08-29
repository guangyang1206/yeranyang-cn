const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SRC = '/projects/.openclaw/media/tool-image-generation/image-1---80ebe6a4-cafb-45dd-a57c-d00e2d48da4d.png';
const OUT_DIR = '/projects/ai-articles/articles/ai/2026-06-09_claude-fable-5/assets';
const W = 900, H = 383;

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const b64 = fs.readFileSync(SRC).toString('base64');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });

  await page.setContent(`<body style="margin:0">
    <img id="t" src="data:image/png;base64,${b64}"
         style="width:${W}px;height:${H}px;object-fit:cover;display:block">
  </body>`);
  await page.waitForFunction(() => {
    const i = document.getElementById('t');
    return i && i.complete && i.naturalWidth > 0;
  });

  // 原图存备查
  fs.writeFileSync(path.join(OUT_DIR, 'cover-original.png'), fs.readFileSync(SRC));
  // 裁剪后的头图
  await page.screenshot({ path: path.join(OUT_DIR, 'cover-900x383.png') });
  // 压缩 JPEG
  await page.screenshot({ path: path.join(OUT_DIR, 'cover-900x383.jpg'), type: 'jpeg', quality: 78 });
  await browser.close();

  for (const f of ['cover-900x383.png', 'cover-900x383.jpg']) {
    const s = fs.statSync(path.join(OUT_DIR, f)).size;
    console.log(f, (s / 1024).toFixed(1) + 'KB');
  }
})();
