// 排版精修验收脚本: 计算样式断言 + 截图 (方案 article-typography-refine.md §验证)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT = path.join(__dirname, '..', 'output', 'typography-check');
if (!fs.existsSync(OUTPUT)) fs.mkdirSync(OUTPUT, { recursive: true });

// 含 h1-h4 + 行内代码 + 代码块的长文 (Java 集合框架页, 历史截图同款)
const ARTICLE = 'http://localhost:3000/#/md/01-%E8%AE%A1%E7%AE%97%E6%9C%BA%E5%9F%BA%E7%A1%80/00-Java%E4%B8%8EJVM';

(async () => {
  const browser = await chromium.launch();
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.goto(ARTICLE, { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(2000);

  // --- 计算样式断言 ---
  const report = await page.evaluate(() => {
    const ms = document.querySelector('.markdown-section');
    const out = {};
    const pick = (sel) => ms && ms.querySelector(sel);
    const style = (el, props) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      return Object.fromEntries(props.map((p) => [p, cs[p]]));
    };
    const H = ['h1', 'h2', 'h3', 'h4'];
    for (const h of H) {
      const el = pick(h);
      out[h] = style(el, ['color', 'fontSize', 'borderBottomWidth', 'fontFamily']);
      const anchorSpan = el && el.querySelector('.anchor span');
      out[h + ' .anchor span'] = style(anchorSpan, ['color']);
      const anchor = el && el.querySelector('.anchor');
      out[h + ' .anchor'] = style(anchor, ['borderBottomWidth']);
    }
    out['inline code'] = style(pick(':not(pre) > code'), ['color', 'background']);
    out['pre'] = style(pick('pre'), ['paddingTop']);
    return out;
  });
  console.log(JSON.stringify(report, null, 2));

  const fails = [];
  const ink = 'rgb(32, 33, 29)'; // --studio-text #20211d
  for (const h of ['h1', 'h2', 'h3', 'h4']) {
    if (!report[h]) { console.log(`(跳过 ${h}: 测试文无此层级)`); continue; }
    if (report[h].color !== ink) fails.push(`${h} color=${report[h].color} (期望 ${ink})`);
    if (report[h].borderBottomWidth !== '0px') fails.push(`${h} border-bottom=${report[h].borderBottomWidth}`);
    if (report[h + ' .anchor'] && report[h + ' .anchor'].borderBottomWidth !== '0px')
      fails.push(`${h} .anchor border-bottom=${report[h + ' .anchor'].borderBottomWidth}`);
  }
  if (report.h1 && report.h1.fontSize !== '44px') fails.push(`h1 fontSize=${report.h1.fontSize} (期望 44px)`);
  if (report['inline code'] && report['inline code'].color !== ink)
    fails.push(`inline code color=${report['inline code'].color}`);
  if (report.pre && report.pre.paddingTop !== '42px') fails.push(`pre paddingTop=${report.pre.paddingTop}`);

  // --- 截图: 顶部 (h1) + 滚动到 h2/h3 + 代码块 ---
  await page.screenshot({ path: path.join(OUTPUT, '1440-top.png') });
  const h2 = await page.$('.markdown-section h2');
  if (h2) { await h2.scrollIntoViewIfNeeded(); await page.waitForTimeout(400); }
  await page.screenshot({ path: path.join(OUTPUT, '1440-h2.png') });
  const pre = await page.$('.markdown-section pre');
  if (pre) { await pre.scrollIntoViewIfNeeded(); await page.waitForTimeout(400); }
  await page.screenshot({ path: path.join(OUTPUT, '1440-code.png') });

  // --- 移动端 390 ---
  const m = await (await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })).newPage();
  await m.goto(ARTICLE, { waitUntil: 'networkidle', timeout: 20000 });
  await m.waitForTimeout(2000);
  await m.screenshot({ path: path.join(OUTPUT, '390-top.png') });
  const h1w = await m.evaluate(() => {
    const h1 = document.querySelector('.markdown-section h1');
    return h1 ? { fontSize: getComputedStyle(h1).fontSize, overflow: h1.scrollWidth > h1.clientWidth } : null;
  });
  console.log('mobile h1 (390px):', JSON.stringify(h1w));
  // 级联: ≤1024→30px, ≤768→28px, ≤390→26px; 390 视口命中 26px
  if (h1w && h1w.fontSize !== '26px') fails.push(`移动端 h1=${h1w.fontSize} (期望 26px@390)`);
  if (h1w && h1w.overflow) fails.push('移动端 h1 横向溢出');

  // --- 800px 视口验证 ≤1024 档 h1=30px ---
  const t = await (await browser.newContext({ viewport: { width: 800, height: 1000 } })).newPage();
  await t.goto(ARTICLE, { waitUntil: 'networkidle', timeout: 20000 });
  await t.waitForTimeout(1500);
  const h1t = await t.evaluate(() => {
    const h1 = document.querySelector('.markdown-section h1');
    return h1 ? getComputedStyle(h1).fontSize : null;
  });
  console.log('tablet h1 (800px):', h1t);
  if (h1t !== '30px') fails.push(`平板 h1=${h1t} (期望 30px@800)`);

  // --- 首页回归 ---
  const home = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await home.goto('http://localhost:3000/#/', { waitUntil: 'networkidle', timeout: 20000 });
  await home.waitForTimeout(2000);
  await home.screenshot({ path: path.join(OUTPUT, '1440-home.png') });

  await browser.close();
  if (fails.length) { console.log('\n❌ 断言失败:'); fails.forEach((f) => console.log(' -', f)); process.exit(1); }
  console.log('\n✅ 全部断言通过, 截图在 output/typography-check/');
})();
