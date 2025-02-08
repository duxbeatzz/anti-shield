//server/beowser.ts

import puppeteer, { Page } from 'puppeteer';
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
  // Additional flags for Replit environment
  '--disable-gpu',
  '--disable-software-rasterizer',
  '--headless=new',
  '--remote-debugging-port=0',
];

// WebGL advanced configurations
const WEBGL_VENDOR_OVERRIDES = {
  'UNMASKED_VENDOR_WEBGL': 0x9245,
  'UNMASKED_RENDERER_WEBGL': 0x9246,
};

export async function launchBrowser(profile: BrowserProfile) {
  try {
    console.log('Launching browser with profile:', profile.name);

    // Find Chrome executable
    const executablePath = '/nix/store/chromium-114.0.5735.198-bin/bin/chromium';
    console.log('Using Chrome executable path:', executablePath);

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

    console.log('Launching browser with args:', args);

    const browser = await puppeteer.launch({
      headless: 'new',
      args,
      ignoreDefaultArgs: ['--enable-automation'],
      executablePath,
    }).catch(error => {
      console.error('Failed to launch browser:', error);
      throw new Error(`Browser launch failed: ${error.message}`);
    });

    console.log('Browser launched successfully');

    const page = await browser.newPage().catch(error => {
      console.error('Failed to create new page:', error);
      throw new Error(`Page creation failed: ${error.message}`);
    });

    console.log('New page created');

    // Apply fingerprint spoofing
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
        value: async (...args: any[]) => {
          const stream = await originalGetUserMedia(...args);
          return Object.defineProperty(stream, 'id', { value: Math.random().toString(36) });
        },
      });
    }).catch(error => {
      console.error('Failed to apply fingerprint spoofing:', error);
      throw new Error(`Fingerprint spoofing failed: ${error.message}`);
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
        if (parameter === WEBGL_VENDOR_OVERRIDES.UNMASKED_VENDOR_WEBGL) return profile.webglVendor;
        if (parameter === WEBGL_VENDOR_OVERRIDES.UNMASKED_RENDERER_WEBGL) return profile.webglRenderer;
        return originalGetParameter.call(this, parameter);
      };
    }, profile).catch(error => {
      console.error('Failed to apply profile configurations:', error);
      throw new Error(`Profile configuration failed: ${error.message}`);
    });

    // Set cookies if available
    if (profile.cookies && Array.isArray(profile.cookies)) {
      await page.setCookie(...profile.cookies).catch(error => {
        console.error('Failed to set cookies:', error);
        throw new Error(`Cookie setting failed: ${error.message}`);
      });
    }

    console.log('Browser profile configured successfully');
    return browser;
  } catch (error) {
    console.error('Error in launchBrowser:', error);
    throw error;
  }
}

// Helper function to get browser fingerprint
export async function getBrowserFingerprint(page: Page) {
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