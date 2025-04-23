import puppeteer from 'puppeteer';
const browser = await puppeteer.launch();
const page = await browser.newPage();
 // Set screen size
await page.setViewport({
                        width: 1240,
                        height: 700,
                        deviceScaleFactor: 1,
                      });
await page.goto('https://hayesmedia.co.za', {
  waitUntil: 'networkidle2',
});
await page.screenshot({
  path: 'hn.png',
});

await browser.close();