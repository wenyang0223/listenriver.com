import { chromium } from "playwright";

const target = process.argv[2] || "https://listenriver.com/search/?q=%E8%8B%B1%E9%9B%84";
const browser = await chromium.launch({ headless: true });
const checks = [];

async function checkViewport(name, viewport) {
  const page = await browser.newPage({ viewport });
  const errors = [];
  const failed = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("requestfailed", (request) => {
    failed.push({
      url: request.url(),
      failure: request.failure()?.errorText,
    });
  });

  await page.goto(target, { waitUntil: "load", timeout: 30000 });
  await page.waitForSelector(".pagefind-ui__search-input", { timeout: 15000 }).catch(() => null);
  await page.waitForTimeout(3500);

  const data = await page.evaluate(() => {
    const input = document.querySelector(".pagefind-ui__search-input");
    return {
      url: location.href,
      title: document.title,
      inputValue: input ? input.value : null,
      inputVisible: input ? Boolean(input.offsetWidth || input.offsetHeight || input.getClientRects().length) : false,
      message: document.querySelector(".pagefind-ui__message")?.textContent?.trim() || "",
      resultCount: document.querySelectorAll(".pagefind-ui__result").length,
      results: [...document.querySelectorAll(".pagefind-ui__result-link")].slice(0, 6).map((link) => ({
        text: link.textContent.trim(),
        href: link.href,
      })),
      overflow: Math.max(0, document.documentElement.scrollWidth - document.documentElement.clientWidth),
      pagefindScripts: [...document.scripts].filter((script) => script.src.includes("/pagefind/")).map((script) => script.src),
      pagefindCss: [...document.querySelectorAll('link[href*="/pagefind/"]')].map((link) => link.href),
    };
  });

  checks.push({
    viewport: name,
    ...data,
    errors,
    failedPagefind: failed.filter((request) => request.url.includes("/pagefind/")),
  });

  await page.close();
}

await checkViewport("desktop", { width: 1280, height: 900 });
await checkViewport("mobile", { width: 390, height: 844 });

await browser.close();
console.log(JSON.stringify(checks, null, 2));
