import { loadConsentRecord, type ConsentRecord } from '@/components/GDPRConsent';

type GoogleAdsConversion = 'signup' | 'begin_checkout' | 'purchase';

declare global {
  interface Navigator {
    globalPrivacyControl?: boolean;
  }

  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const enabled = import.meta.env.VITE_ENABLE_GOOGLE_ADS === 'true';
const adsId = import.meta.env.VITE_GOOGLE_ADS_ID;

const conversionLabels: Record<GoogleAdsConversion, string | undefined> = {
  signup: import.meta.env.VITE_GOOGLE_ADS_SIGNUP_CONVERSION_LABEL,
  begin_checkout: import.meta.env.VITE_GOOGLE_ADS_CHECKOUT_CONVERSION_LABEL,
  purchase: import.meta.env.VITE_GOOGLE_ADS_PURCHASE_CONVERSION_LABEL,
};

let scriptLoaded = false;
let initialized = false;

function hasMarketingConsent(record: ConsentRecord | null): boolean {
  if (!record?.marketing) return false;
  if (navigator.doNotTrack === '1') return false;
  if (navigator.globalPrivacyControl === true) return false;
  return true;
}

function shouldLoad(): boolean {
  return enabled && Boolean(adsId) && hasMarketingConsent(loadConsentRecord());
}

function loadScript(): void {
  if (scriptLoaded || !adsId) return;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtagShim(...args: unknown[]) {
    window.dataLayer?.push(args);
  };

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(adsId)}`;
  document.head.appendChild(script);
  scriptLoaded = true;
}

export function initializeGoogleAdsFromConsent(): void {
  if (!shouldLoad()) return;

  loadScript();
  if (initialized || !window.gtag || !adsId) return;

  window.gtag('js', new Date());
  window.gtag('config', adsId, {
    anonymize_ip: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    send_page_view: false,
  });
  initialized = true;
}

export function trackGoogleAdsPageView(path: string): void {
  initializeGoogleAdsFromConsent();
  if (!initialized || !window.gtag || !adsId) return;

  window.gtag('event', 'page_view', {
    page_path: path,
    send_to: adsId,
  });
}

export function trackGoogleAdsConversion(conversion: GoogleAdsConversion): void {
  initializeGoogleAdsFromConsent();
  const label = conversionLabels[conversion];
  if (!initialized || !window.gtag || !adsId || !label) return;

  window.gtag('event', 'conversion', {
    send_to: `${adsId}/${label}`,
  });
}

export function bindGoogleAdsConsentListener(): () => void {
  const handleConsentUpdate = () => initializeGoogleAdsFromConsent();
  window.addEventListener('gdpr:consentUpdated', handleConsentUpdate);
  initializeGoogleAdsFromConsent();
  return () => window.removeEventListener('gdpr:consentUpdated', handleConsentUpdate);
}
