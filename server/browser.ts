import puppeteer from 'puppeteer';
import { BrowserProfile } from '@shared/schema';

// Advanced launch options to better mimic real browsers
const DEFAULT_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-infobars',
  '--disable-dev-shm-usage',
  '--disable-blink-features=AutomationControlled',
  '--disable-blink-features',
  '--no-first-run',
  '--no-service-autorun',
  '--password-store=basic',
  '--system-developer-mode',
];

// WebGL advanced configurations
const WEBGL_VENDOR_OVERRIDES = {
  'UNMASKED_VENDOR_WEBGL': 0x9245,
  'UNMASKED_RENDERER_WEBGL': 0x9246,
};

export async function launchBrowser(profile: BrowserProfile) {
  const args = [
    ...DEFAULT_ARGS,
    `--window-size=${profile.screenResolution}`,
    `--user-agent=${profile.userAgent}`,
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
    ignoreDefaultArgs: ['--enable-automation'],
  });

  const page = await browser.newPage();

  // Advanced fingerprint spoofing
  await page.evaluateOnNewDocument(() => {
    // Override navigator properties
    const overrides = {
      webdriver: false,
      languages: navigator.languages,
      plugins: { length: 3 },
      chrome: { app: {}, runtime: {}, webstore: {} },
      permissions: { query: async () => ({ state: "prompt" }) },
    };

    Object.defineProperties(navigator, {
      ...Object.entries(overrides).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: { get: () => value }
      }), {})
    });

    // Override webRTC
    const originalGetUserMedia = navigator.mediaDevices?.getUserMedia.bind(navigator.mediaDevices);
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      value: async (...args) => {
        const stream = await originalGetUserMedia(...args);
        return Object.defineProperty(stream, 'id', { value: Math.random().toString(36) });
      },
    });
  });

  // Apply profile-specific configurations
  await page.evaluateOnNewDocument((profile) => {
    Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => profile.hardwareConcurrency });
    Object.defineProperty(navigator, 'deviceMemory', { get: () => profile.deviceMemory });
    Object.defineProperty(navigator, 'platform', { get: () => profile.platform });
    Object.defineProperty(navigator, 'language', { get: () => profile.language });

    // Advanced WebGL spoofing
    const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
    WebGLRenderingContext.prototype.getParameter = function(parameter) {
      // Handle special WebGL parameters
      if (parameter === WEBGL_VENDOR_OVERRIDES.UNMASKED_VENDOR_WEBGL) return profile.webglVendor;
      if (parameter === WEBGL_VENDOR_OVERRIDES.UNMASKED_RENDERER_WEBGL) return profile.webglRenderer;
      return originalGetParameter.call(this, parameter);
    };
  }, profile);

  // Set cookies if available
  if (profile.cookies && Array.isArray(profile.cookies)) {
    await page.setCookie(...profile.cookies);
  }

  return browser;
}

// Helper function to get browser fingerprint
export async function getBrowserFingerprint(page: puppeteer.Page) {
  return await page.evaluate(() => ({
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: (navigator as any).deviceMemory,
    webglVendor: (document.createElement('canvas').getContext('webgl') as WebGLRenderingContext)
      ?.getParameter(WEBGL_VENDOR_OVERRIDES.UNMASKED_VENDOR_WEBGL),
    webglRenderer: (document.createElement('canvas').getContext('webgl') as WebGLRenderingContext)
      ?.getParameter(WEBGL_VENDOR_OVERRIDES.UNMASKED_RENDERER_WEBGL),
  }));
}