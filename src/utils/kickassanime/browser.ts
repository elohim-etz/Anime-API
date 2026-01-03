import puppeteer, { Browser, Page } from "puppeteer";

let browserInstance: Browser | null = null;

/**
 * Get or create a browser instance (singleton pattern)
 */
export const getBrowser = async (): Promise<Browser> => {
  if (!browserInstance || !browserInstance.connected) {
    browserInstance = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-blink-features=AutomationControlled",
      ],
    });
  }
  return browserInstance;
};

/**
 * Close the browser instance
 */
export const closeBrowser = async (): Promise<void> => {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
};

/**
 * Wait for Cloudflare challenge to complete
 */
const waitForCloudflare = async (page: Page): Promise<void> => {
  // Wait for the challenge to complete by checking for typical Cloudflare elements
  const maxWait = 30000;
  const startTime = Date.now();

  while (Date.now() - startTime < maxWait) {
    const hasChallenge = await page.evaluate(() => {
      return (
        document.querySelector("#challenge-running") !== null ||
        document.querySelector("#challenge-stage") !== null ||
        document.querySelector(".cf-browser-verification") !== null ||
        document.title.includes("Just a moment")
      );
    });

    if (!hasChallenge) {
      // Give it a bit more time for page to fully load
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error("Cloudflare challenge timeout");
};

/**
 * Make a GET request using Puppeteer to bypass Cloudflare
 */
export const puppeteerGet = async (url: string): Promise<any> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set user agent to look like a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set extra headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // Navigate to the URL
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for Cloudflare challenge to complete
    await waitForCloudflare(page);

    // Get the page content
    const content = await page.content();

    // Try to extract JSON from the page
    const jsonMatch = content.match(/<pre[^>]*>([\s\S]*?)<\/pre>/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }

    // Try to get text content and parse as JSON
    const textContent = await page.evaluate(() => document.body.innerText);
    try {
      return JSON.parse(textContent);
    } catch {
      // Return raw content if not JSON
      throw new Error("Response is not JSON: " + textContent.substring(0, 200));
    }
  } finally {
    await page.close();
  }
};

/**
 * Make a POST request using Puppeteer to bypass Cloudflare
 */
export const puppeteerPost = async (
  url: string,
  payload: any
): Promise<any> => {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    // Set user agent to look like a real browser
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    // Set extra headers
    await page.setExtraHTTPHeaders({
      "Accept-Language": "en-US,en;q=0.9",
    });

    // First visit the base domain to get cookies
    const baseUrl = new URL(url).origin;
    await page.goto(baseUrl, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Wait for Cloudflare challenge to complete
    await waitForCloudflare(page);

    // Now make the actual POST request using fetch in page context
    const result = await page.evaluate(
      async (fetchUrl: string, fetchPayload: any) => {
        const response = await fetch(fetchUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json, text/plain, */*",
          },
          body: JSON.stringify(fetchPayload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response.json();
      },
      url,
      payload
    );

    return result;
  } finally {
    await page.close();
  }
};
