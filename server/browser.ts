import puppeteer from 'puppeteer';
import { BrowserProfile } from '@shared/schema';

export async function launchBrowser(profile: BrowserProfile) {
  const args = [
    `--window-size=${profile.screenResolution}`,
    '--no-sandbox',
    '--disable-setuid-sandbox'
  ];

  if (profile.proxyEnabled && profile.proxyHost && profile.proxyPort) {
    const proxyArg = profile.proxyUsername && profile.proxyPassword 
      ? `--proxy-server=${profile.proxyHost}:${profile.proxyPort} --proxy-auth=${profile.proxyUsername}:${profile.proxyPassword}`
      : `--proxy-server=${profile.proxyHost}:${profile.proxyPort}`;
    args.push(proxyArg);
  }

  const browser = await puppeteer.launch({
    headless: false,
    args,
  });

  const page = await browser.newPage();
  
  await page.setUserAgent(profile.userAgent);
  
  await page.evaluateOnNewDocument((profile) => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => profile.hardwareConcurrency });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => profile.deviceMemory });
    Object.defineProperty(navigator, 'platform', { get: () => profile.platform });
    Object.defineProperty(navigator, 'language', { get: () => profile.language });
    
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      if (parameter === 37445) return profile.webglVendor;
      if (parameter === 37446) return profile.webglRenderer;
      return originalGetParameter.call(this, parameter);
    };
  }, profile);

  return browser;
}
