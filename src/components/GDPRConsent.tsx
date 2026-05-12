/**
 * GDPRConsent.tsx — GDPR Consent Management Banner
 *
 * Slide-up banner at bottom of page with granular consent controls.
 * Categories: Essential (always on), Analytics, Functional, Marketing.
 * Stores consent securely with timestamp. Only shows if consent not yet given.
 * Can be reopened via footer link using a custom event.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  ChevronUp,
  ChevronDown,
  Check,
  Cookie,
  BarChart3,
  Settings,
  Megaphone,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { secureStorage } from '@/lib/security';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConsentCategory {
  id: string;
  label: string;
  description: string;
  required: boolean;
  icon: ReactNode;
  details: string[];
}

export interface ConsentRecord {
  essential: boolean;
  analytics: boolean;
  functional: boolean;
  marketing: boolean;
  timestamp: string;
  version: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CONSENT_KEY = 'gdpr_consent';
const CONSENT_VERSION = '1.0.0';

const CATEGORIES: ConsentCategory[] = [
  {
    id: 'essential',
    label: 'Essential',
    description: 'Required for the site to function. Includes session management, security, and CSRF protection.',
    required: true,
    icon: <Lock size={18} />,
    details: [
      'Session authentication tokens',
      'CSRF protection tokens',
      'Security cookies',
      'Load balancing',
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    description: 'Anonymous usage statistics to help us improve. No personal data or IP addresses are collected.',
    required: false,
    icon: <BarChart3 size={18} />,
    details: [
      'Page view counts (anonymized)',
      'Feature usage frequency',
      'Error rate tracking',
      'Performance metrics',
      'No IP addresses stored',
      'No personal identifiers',
    ],
  },
  {
    id: 'functional',
    label: 'Functional',
    description: 'Preferences and settings to enhance your experience.',
    required: false,
    icon: <Settings size={18} />,
    details: [
      'Language preference',
      'Theme settings',
      'Display preferences',
      'Form auto-save',
    ],
  },
  {
    id: 'marketing',
    label: 'Marketing',
    description: 'Used for future marketing features. Currently not active but you can set your preference.',
    required: false,
    icon: <Megaphone size={18} />,
    details: [
      'Promotional emails (future)',
      'Product updates (future)',
      'Partner offers (future)',
      'Currently not in use',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Load the current consent record from secure storage.
 */
export function loadConsentRecord(): ConsentRecord | null {
  return secureStorage.get<ConsentRecord>(CONSENT_KEY);
}

/**
 * Save a consent record to secure storage.
 */
export function saveConsentRecord(record: Omit<ConsentRecord, 'timestamp' | 'version'>): void {
  const full: ConsentRecord = {
    ...record,
    timestamp: new Date().toISOString(),
    version: CONSENT_VERSION,
  };
  secureStorage.set(CONSENT_KEY, full);

  // Also append to consent history
  const history = secureStorage.get<Array<{ action: string; timestamp: string; categories: string[] }>>(
    'consent_history'
  ) ?? [];
  const activeCategories = Object.entries(full)
    .filter(([k, v]) => v === true && k !== 'timestamp' && k !== 'version')
    .map(([k]) => k);
  history.push({
    action: record.analytics || record.functional || record.marketing ? 'granted' : 'essential_only',
    timestamp: full.timestamp,
    categories: activeCategories,
  });
  secureStorage.set('consent_history', history);

  // Dispatch event so other components can react
  window.dispatchEvent(new CustomEvent('gdpr:consentUpdated', { detail: full }));
}

/**
 * Check if user has already given consent.
 */
export function hasConsent(): boolean {
  return loadConsentRecord() !== null;
}

/**
 * Open the consent banner programmatically (e.g., from footer link).
 */
export function openConsentBanner(): void {
  window.dispatchEvent(new CustomEvent('gdpr:openBanner'));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function GDPRConsent() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true,
    analytics: false,
    functional: false,
    marketing: false,
  });

  // Show banner on mount if consent not given; also listen for reopen event
  useEffect(() => {
    if (!hasConsent()) {
      setVisible(true);
    }

    const handleOpen = () => {
      // Load existing preferences when reopening
      const existing = loadConsentRecord();
      if (existing) {
        setPreferences({
          essential: true,
          analytics: existing.analytics,
          functional: existing.functional,
          marketing: existing.marketing,
        });
      }
      setVisible(true);
      setExpanded(true);
    };

    window.addEventListener('gdpr:openBanner', handleOpen);
    return () => window.removeEventListener('gdpr:openBanner', handleOpen);
  }, []);

  const handleToggle = useCallback((categoryId: string) => {
    if (categoryId === 'essential') return; // Always on
    setPreferences((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId as keyof typeof prev],
    }));
  }, []);

  const handleAcceptAll = useCallback(() => {
    const all = {
      essential: true,
      analytics: true,
      functional: true,
      marketing: true,
    };
    setPreferences(all);
    saveConsentRecord(all);
    setVisible(false);
    setExpanded(false);
  }, []);

  const handleSavePreferences = useCallback(() => {
    saveConsentRecord(preferences);
    setVisible(false);
    setExpanded(false);
  }, [preferences]);

  const handleAcceptEssentialOnly = useCallback(() => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      functional: false,
      marketing: false,
    };
    setPreferences(essentialOnly);
    saveConsentRecord(essentialOnly);
    setVisible(false);
    setExpanded(false);
  }, []);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 400, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-0 left-0 right-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label="Cookie consent preferences"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 bottom-0 top-[-100vh] bg-black/30"
            onClick={() => setExpanded(true)}
            aria-hidden="true"
          />

          {/* Banner */}
          <div className="relative bg-[#0B1628] border-t border-[#162544] shadow-2xl">
            {/* Top gradient accent */}
            <div
              className="h-[2px] w-full"
              style={{ background: 'linear-gradient(90deg, #4B82FF, #00D68F)' }}
            />

            <div className="max-w-7xl mx-auto px-6 py-5">
              {/* Collapsed view */}
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-[rgba(75,130,255,0.15)] flex items-center justify-center">
                    <Cookie size={20} className="text-[#4B82FF]" />
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-[#E8EEF7] text-sm">
                      We value your privacy
                    </h3>
                    <p className="text-xs text-[#8BA3C7] mt-0.5">
                      We use cookies and similar technologies to enhance your experience.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 ml-auto flex-shrink-0">
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="font-body text-xs font-medium text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-[#162544]"
                    aria-expanded={expanded}
                    aria-controls="consent-details"
                  >
                    {expanded ? (
                      <>
                        Hide Details <ChevronDown size={14} />
                      </>
                    ) : (
                      <>
                        Customize <ChevronUp size={14} />
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleAcceptEssentialOnly}
                    className="font-body text-xs font-medium text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors px-4 py-2 rounded-lg border border-[#162544] hover:border-[#1E3260]"
                  >
                    Essential Only
                  </button>
                  <button
                    onClick={handleAcceptAll}
                    className="font-body text-xs font-semibold text-white px-5 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
                    style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
                  >
                    <Check size={14} />
                    Accept All
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    id="consent-details"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="mt-5 pt-5 border-t border-[#162544]">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => {
                          const isOn = preferences[cat.id as keyof typeof preferences];
                          return (
                            <div
                              key={cat.id}
                              className="flex items-start gap-3 p-4 rounded-xl border border-[#162544] hover:border-[#1E3260] transition-colors bg-[#050B14]/40"
                            >
                              <div className="w-8 h-8 rounded-lg bg-[rgba(75,130,255,0.1)] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#4B82FF]">
                                {cat.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-body text-sm font-semibold text-[#E8EEF7]">
                                      {cat.label}
                                    </span>
                                    {cat.required && (
                                      <span className="text-[10px] font-body font-medium px-1.5 py-0.5 rounded bg-[rgba(0,214,143,0.12)] text-[#00D68F]">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <Switch
                                    checked={isOn}
                                    onCheckedChange={() => handleToggle(cat.id)}
                                    disabled={cat.required}
                                    aria-label={`Toggle ${cat.label} cookies`}
                                  />
                                </div>
                                <p className="text-xs text-[#8BA3C7] mt-1.5 leading-relaxed">
                                  {cat.description}
                                </p>
                                <ul className="mt-2 space-y-0.5">
                                  {cat.details.map((d, i) => (
                                    <li
                                      key={i}
                                      className="text-[11px] text-[#4A6180] flex items-center gap-1.5"
                                    >
                                      <Shield size={10} className="flex-shrink-0" />
                                      {d}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Bottom action bar */}
                      <div className="mt-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-[#162544]">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1.5 text-xs text-[#4A6180]">
                            <Shield size={12} className="text-[#00D68F]" />
                            Your data is encrypted at rest
                          </span>
                          <a
                            href="/privacy"
                            className="text-xs text-[#4B82FF] hover:text-[#78A4FF] transition-colors flex items-center gap-1"
                          >
                            Privacy Policy <ExternalLink size={10} />
                          </a>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              setVisible(false);
                              setExpanded(false);
                            }}
                            className="font-body text-xs font-medium text-[#8BA3C7] hover:text-[#E8EEF7] transition-colors px-4 py-2 rounded-lg"
                          >
                            Close
                          </button>
                          <button
                            onClick={handleSavePreferences}
                            className="font-body text-xs font-semibold text-white px-5 py-2 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                            style={{
                              background: 'linear-gradient(135deg, #00D68F 0%, #00A86B 100%)',
                            }}
                          >
                            Save Preferences
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
