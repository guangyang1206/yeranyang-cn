const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 1600 } });

  const htmlPath = 'file://' + path.resolve(__dirname, 'wechat-post-images.html');
  await page.goto(htmlPath, { waitUntil: 'networkidle' });

  const outputDir = __dirname;

  // 图1：首图（第1个 .post-card）
  const hero = await page.locator('.post-card').nth(0);
  await hero.screenshot({ path: path.join(outputDir, '01-hero.png') });
  console.log('✅ 01-hero.png');

  // 图2：对比（第2个 .post-card）
  const compare = await page.locator('.post-card').nth(1);
  await compare.screenshot({ path: path.join(outputDir, '02-compare.png') });
  console.log('✅ 02-compare.png');

  // 图3：定价+安全（第3个 .post-card）
  const pricing = await page.locator('.post-card').nth(2);
  await pricing.screenshot({ path: path.join(outputDir, '03-pricing.png') });
  console.log('✅ 03-pricing.png');

  // 图4：总结（第4个 .post-card）
  const summary = await page.locator('.post-card').nth(3);
  await summary.screenshot({ path: path.join(outputDir, '04-summary.png') });
  console.log('✅ 04-summary.png');

  // 图5：朋友圈（.moment-card）
  const moment = await page.locator('.moment-card');
  await moment.screenshot({ path: path.join(outputDir, '05-moment.png') });
  console.log('✅ 05-moment.png');

  await browser.close();
  console.log('🎉 All done!');
})();
