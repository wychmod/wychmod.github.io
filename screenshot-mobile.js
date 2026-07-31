const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, 'output', 'mobile-screenshots');
if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

const PAGES = [
  { name: 'home', url: 'http://localhost:3000/#/' },
  { name: 'article', url: 'http://localhost:3000/#/md/01-%E8%AE%A1%E7%AE%97%E6%9C%BA%E5%9F%BA%E7%A1%80/00-Java%E4%B8%8EJVM' },
  { name: 'tools-index', url: 'http://localhost:3000/tools/index.html' },
  { name: 'base64-tool', url: 'http://localhost:3000/tools/base64-tool.html' },
  { name: 'url-tool', url: 'http://localhost:3000/tools/url-tool.html' },
  { name: 'not-found', url: 'http://localhost:3000/#/this-page-does-not-exist' },
];

const VIEWPORTS = [
  { name: 'iphone14', width: 390, height: 844, deviceScaleFactor: 3 },
  { name: 'android', width: 360, height: 800, deviceScaleFactor: 2 },
  { name: 'ipad', width: 768, height: 1024, deviceScaleFactor: 2 },
  { name: 'desktop', width: 1440, height: 900, deviceScaleFactor: 1 },
];

(async () => {
  const browser = await chromium.launch();
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: vp.deviceScaleFactor });
    const page = await context.newPage();
    for (const p of PAGES) {
      try {
        await page.goto(p.url, { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(1500);
        const file = path.join(OUTPUT, `${p.name}-${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: false });
        console.log('OK', file);
      } catch (e) {
        console.log('FAIL', p.name, vp.name, e.message);
      }
    }
    await context.close();
  }
  await browser.close();
})();
