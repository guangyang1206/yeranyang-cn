const { chromium } = require('playwright');
const path = require('path');

const target = process.argv[2];
const file = 'file://' + path.resolve(target);

(async () => {
  const browser = await chromium.launch();
  // 模拟手机宽度
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(file, { waitUntil: 'networkidle' });

  // 图片加载检查
  const imgs = await page.evaluate(() =>
    Array.from(document.images).map(i => ({
      ok: i.complete && i.naturalWidth > 0,
      w: i.naturalWidth, h: i.naturalHeight,
      inline: i.src.startsWith('data:')
    }))
  );
  console.log('图片数量:', imgs.length);
  imgs.forEach((i, n) => console.log(`  #${n + 1} loaded=${i.ok} ${i.w}x${i.h} base64=${i.inline}`));

  // 外链图片检查
  const ext = await page.evaluate(() =>
    Array.from(document.images).filter(i => !i.src.startsWith('data:')).map(i => i.src)
  );
  console.log('外链图片:', ext.length === 0 ? '无 ✅' : ext);

  const height = await page.evaluate(() => document.body.scrollHeight);
  console.log('页面总高度:', height + 'px');
  console.log('JS 错误:', errors.length ? errors : '无 ✅');

  const shot = target.replace(/\.html$/, '') + '-preview.png';
  await page.screenshot({ path: shot, fullPage: false });
  console.log('首屏截图:', shot);
  await browser.close();
})();
