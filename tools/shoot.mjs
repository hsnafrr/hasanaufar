/**
 * Captures the 3-image stack for every project listed in js/projects.js.
 *   1 — desktop, top of page
 *   2 — desktop, scrolled one viewport down (a real section, not the hero)
 *   3 — mobile, top of page
 *
 * Run:  node tools/shoot.mjs           (all)
 *       node tools/shoot.mjs pulpora   (one, by slug)
 * Output: assets/shots/<slug>-1.png … -3.png  → convert to .webp (see below)
 */
import { chromium } from 'playwright-core';
import { mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(path.join(root, 'js', 'projects.js'), 'utf8');
const json = src.slice(src.indexOf('['), src.lastIndexOf(']') + 1);
const projects = JSON.parse(json.replace(/,\s*([\]}])/g, '$1'));

const only = process.argv[2];
const list = only ? projects.filter(p => p.slug === only) : projects;
const out = path.join(root, 'assets', 'shots');
await mkdir(out, { recursive: true });

const browser = await chromium.launch();
const desktop = await browser.newContext({
  viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2,
  colorScheme: 'dark', reducedMotion: 'reduce',
});
const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 }, deviceScaleFactor: 3,
  isMobile: true, hasTouch: true, colorScheme: 'dark', reducedMotion: 'reduce',
});

for (const p of list) {
  try {
    const page = await desktop.newPage();
    await page.goto(p.url, { waitUntil: 'networkidle', timeout: 45000 });
    await page.waitForTimeout(2500);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(out, `${p.slug}-1.png`) });

    await page.evaluate(() => window.scrollTo({ top: window.innerHeight * 1.15, behavior: 'instant' }));
    await page.waitForTimeout(1800);
    await page.screenshot({ path: path.join(out, `${p.slug}-2.png`) });
    await page.close();

    const m = await mobile.newPage();
    await m.goto(p.url, { waitUntil: 'networkidle', timeout: 45000 });
    await m.waitForTimeout(2500);
    await m.evaluate(() => window.scrollTo(0, 0));
    await m.screenshot({ path: path.join(out, `${p.slug}-3.png`) });
    await m.close();

    console.log('ok   ', p.slug);
  } catch (e) {
    console.log('FAIL ', p.slug, '-', e.message.split('\n')[0]);
  }
}
await browser.close();
console.log(`
Now convert to webp:
  for f in assets/shots/*.png; do ffmpeg -y -v error -i "$f" -c:v libwebp -q:v 80 "\${f%.png}.webp"; done
  rm assets/shots/*.png`);
