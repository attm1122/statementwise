/**
 * Privacy.tsx — Privacy Settings Page
 *
 * Comprehensive privacy controls at /privacy route.
 * Sections: Privacy Controls, Data Management, Security, Consent History.
 * Integrates DataSubjectRights panel for GDPR rights requests.
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Eye,
  EyeOff,
  BarChart3,
  Mail,
  Trash2,
  Download,
  Clock,
  HardDrive,
  LogOut,
  Monitor,
  Smartphone,
  Globe,
  ChevronRight,
  Check,
  AlertTriangle,
  X,
  History,
  Cookie,
  Lock,
  User,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { secureStorage } from '@/lib/security';
import { useDataRetention } from '@/hooks/useDataRetention';
import DataSubjectRights from '@/components/DataSubjectRights';
import type { RetentionPeriod } from '@/hooks/useDataRetention';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SectionId = 'controls' | 'data' | 'security' | 'consent' | 'rights';

interface ConsentHistoryEntry {
  action: string;
  timestamp: string;
  categories: string[];
}

interface SessionInfo {
  id: string;
  device: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface LoginEntry {
  timestamp: string;
  device: string;
  location: string;
  status: 'success' | 'failed';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}

function estimateStorageUsage(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sw_')) {
      total += localStorage.getItem(key)?.length ?? 0;
    }
  }
  return total * 2; // Approximate bytes from UTF-16
}

// ---------------------------------------------------------------------------
// Section Components
// ---------------------------------------------------------------------------

/** Privacy Controls Section */
function PrivacyControls() {
  const [settings, setSettings] = useState({
    profilePublic: false,
    activityVisible: false,
    marketingEmails: false,
    analyticsParticipation: false,
  });

  useEffect(() => {
    const stored = secureStorage.get<typeof settings>('privacy_settings');
    if (stored) setSettings(stored);
  }, []);

  const update = useCallback((key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => {
      const next = { ...prev, [key]: value };
      secureStorage.set('privacy_settings', next);
      return next;
    });
  }, []);

  const controls = [
    {
      key: 'profilePublic' as const,
      label: 'Profile Visibility',
      description: 'Make your profile visible to other portal members',
      icon: settings.profilePublic ? <Eye size={18} /> : <EyeOff size={18} />,
      iconColor: settings.profilePublic ? '#4B82FF' : '#4A6180',
      note: settings.profilePublic ? 'Your profile is public' : 'Your profile is private',
    },
    {
      key: 'activityVisible' as const,
      label: 'Activity Status',
      description: 'Show when you are active on the platform',
      icon: settings.activityVisible ? <Eye size={18} /> : <EyeOff size={18} />,
      iconColor: settings.activityVisible ? '#4B82FF' : '#4A6180',
      note: null,
    },
    {
      key: 'marketingEmails' as const,
      label: 'Marketing Emails',
      description: 'Receive product updates, tips, and promotional content',
      icon: <Mail size={18} />,
      iconColor: settings.marketingEmails ? '#00D68F' : '#4A6180',
      note: null,
    },
    {
      key: 'analyticsParticipation' as const,
      label: 'Analytics Participation',
      description: 'Help us improve by sharing anonymized usage data',
      icon: <BarChart3 size={18} />,
      iconColor: settings.analyticsParticipation ? '#00D68F' : '#4A6180',
      note: 'All data is anonymized — no PII, no IP addresses',
    },
  ];

  return (
    <div className="space-y-3">
      {controls.map((ctrl) => (
        <div
          key={ctrl.key}
          className="flex items-center justify-between p-4 rounded-xl bg-[#050B14]/60 border border-[#162544] hover:border-[#1E3260] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-[#4A6180]" style={{ color: ctrl.iconColor }}>
              {ctrl.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-[#E8EEF7]">{ctrl.label}</p>
              <p className="text-xs text-[#8BA3C7] mt-0.5">{ctrl.description}</p>
              {ctrl.note && (
                <p className="text-[11px] text-[#4A6180] mt-1 flex items-center gap-1">
                  <Shield size={10} />
                  {ctrl.note}
                </p>
              )}
            </div>
          </div>
          <Switch
            checked={settings[ctrl.key]}
            onCheckedChange={(v) => update(ctrl.key, v)}
            aria-label={ctrl.label}
          />
        </div>
      ))}
    </div>
  );
}

/** Data Management Section */
function DataManagement() {
  const [retention, retentionActions] = useDataRetention(30);
  const [storageUsed, setStorageUsed] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    setStorageUsed(estimateStorageUsage());
  }, [cleared]);

  const handleClearData = () => {
    retentionActions.clearAllData();
    setShowClearConfirm(false);
    setCleared(true);
    setTimeout(() => setCleared(false), 4000);
  };

  const retentionOptions: { value: RetentionPeriod; label: string }[] = [
    { value: 7, label: '7 days' },
    { value: 30, label: '30 days' },
    { value: 90, label: '90 days' },
  ];

  return (
    <div className="space-y-5">
      {/* Storage usage */}
      <div className="p-4 rounded-xl bg-[#050B14]/60 border border-[#162544]">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <HardDrive size={18} className="text-[#4B82FF]" />
            <div>
              <p className="text-sm font-medium text-[#E8EEF7]">Storage Usage</p>
              <p className="text-xs text-[#8BA3C7]">{formatBytes(storageUsed)} used</p>
            </div>
          </div>
          <span className="text-lg font-semibold text-[#E8EEF7]">{formatBytes(storageUsed)}</span>
        </div>
        <div className="h-2 bg-[#162544] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, #4B82FF, #00D68F)',
              width: `${Math.min((storageUsed / (50 * 1024 * 1024)) * 100, 100)}%`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((storageUsed / (50 * 1024 * 1024)) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
        <p className="text-[11px] text-[#4A6180] mt-2">50 MB limit for free accounts</p>
      </div>

      {/* Retention period */}
      <div className="p-4 rounded-xl bg-[#050B14]/60 border border-[#162544]">
        <div className="flex items-center gap-3 mb-3">
          <Clock size={18} className="text-[#4B82FF]" />
          <div>
            <p className="text-sm font-medium text-[#E8EEF7]">Auto-Delete Data After</p>
            <p className="text-xs text-[#8BA3C7]">Automatically delete data after the selected period</p>
          </div>
        </div>
        <div className="flex gap-2">
          {retentionOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => retentionActions.setRetentionPeriod(opt.value)}
              className={`font-body text-sm px-4 py-2 rounded-lg border transition-all duration-200 ${
                retention.retentionDays === opt.value
                  ? 'border-[#4B82FF] bg-[rgba(75,130,255,0.12)] text-[#4B82FF] font-medium'
                  : 'border-[#162544] text-[#8BA3C7] hover:border-[#1E3260] hover:text-[#E8EEF7]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Countdown timer */}
        <div className="mt-3 p-3 rounded-lg bg-[#162544]/30 border border-[#162544]">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#8BA3C7] flex items-center gap-1.5">
              <RotateCcw size={12} />
              Next cleanup
            </span>
            <span
              className={`text-sm font-mono font-medium ${
                retention.warningLevel === 'expired'
                  ? 'text-[#FF4D6A]'
                  : retention.warningLevel === '1h'
                    ? 'text-[#FFB020]'
                    : retention.warningLevel === '24h'
                      ? 'text-[#FFB020]'
                      : 'text-[#00D68F]'
              }`}
            >
              {retention.countdownText}
            </span>
          </div>
          {retention.warningLevel === '24h' && (
            <p className="text-[11px] text-[#FFB020] mt-1">Your data will be deleted within 24 hours</p>
          )}
          {retention.warningLevel === '1h' && (
            <p className="text-[11px] text-[#FF4D6A] mt-1">Your data will be deleted within 1 hour!</p>
          )}
        </div>

        {/* Auto-delete toggle */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-[#8BA3C7]">Auto-delete enabled</span>
          <Switch
            checked={retention.autoDeleteEnabled}
            onCheckedChange={() => retentionActions.toggleAutoDelete()}
            aria-label="Toggle auto-delete"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="font-body text-sm font-semibold text-white px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF4D6A 0%, #CC2D4A 100%)' }}
          >
            <Trash2 size={16} />
            Clear All Data
          </button>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)]"
          >
            <AlertTriangle size={18} className="text-[#FF4D6A]" />
            <span className="text-sm text-[#E8EEF7]">Are you sure?</span>
            <button
              onClick={handleClearData}
              className="font-body text-xs font-semibold text-white px-3 py-1.5 rounded-md bg-[#FF4D6A] hover:bg-[#CC2D4A] transition-colors"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="font-body text-xs text-[#8BA3C7] hover:text-[#E8EEF7] px-3 py-1.5 transition-colors"
            >
              Cancel
            </button>
          </motion.div>
        )}

        <button
          onClick={() => {
            const data = gatherAllData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `statementwise-all-data-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="font-body text-sm font-medium text-[#8BA3C7] hover:text-[#E8EEF7] px-5 py-2.5 rounded-lg border border-[#162544] hover:border-[#1E3260] transition-all flex items-center gap-2"
        >
          <Download size={16} />
          Download All Data
        </button>
      </div>

      {cleared && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-[rgba(0,214,143,0.08)] border border-[rgba(0,214,143,0.2)] text-sm text-[#00D68F] flex items-center gap-2"
        >
          <Check size={14} />
          All data has been cleared successfully.
        </motion.div>
      )}
    </div>
  );
}

/** Gather all user data for download */
function gatherAllData(): Record<string, unknown> {
  const data: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('sw_')) {
      try {
        data[key] = JSON.parse(localStorage.getItem(key) ?? 'null');
      } catch {
        data[key] = localStorage.getItem(key);
      }
    }
  }
  return {
    exportMetadata: {
      generatedAt: new Date().toISOString(),
      format: 'JSON',
      source: 'Statementwise.ai',
    },
    data,
  };
}

/** Security Section */
function SecuritySection() {
  const [sessions, setSessions] = useState<SessionInfo[]>([
    {
      id: 'session-1',
      device: 'Chrome / macOS',
      location: 'San Francisco, US',
      lastActive: new Date().toISOString(),
      current: true,
    },
    {
      id: 'session-2',
      device: 'Safari / iOS',
      location: 'San Francisco, US',
      lastActive: new Date(Date.now() - 86400000).toISOString(),
      current: false,
    },
  ]);

  const [loginHistory] = useState<LoginEntry[]>([
    {
      timestamp: new Date().toISOString(),
      device: 'Chrome / macOS',
      location: 'San Francisco, US',
      status: 'success',
    },
    {
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      device: 'Safari / iOS',
      location: 'San Francisco, US',
      status: 'success',
    },
    {
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      device: 'Firefox / Windows',
      location: 'New York, US',
      status: 'failed',
    },
  ]);

  const handleRevokeAll = () => {
    setSessions((prev) => prev.filter((s) => s.current));
  };

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-5">
      {/* Active sessions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-body text-sm font-semibold text-[#E8EEF7]">Active Sessions</h3>
          <button
            onClick={handleRevokeAll}
            className="font-body text-xs font-medium text-[#FF4D6A] hover:text-[#CC2D4A] transition-colors flex items-center gap-1"
          >
            <LogOut size={12} />
            Revoke All Others
          </button>
        </div>
        <div className="space-y-2">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                session.current
                  ? 'bg-[rgba(0,214,143,0.05)] border-[rgba(0,214,143,0.15)]'
                  : 'bg-[#050B14]/60 border-[#162544]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-[#4A6180]">
                  {session.device.includes('iOS') || session.device.includes('Android') ? (
                    <Smartphone size={16} />
                  ) : (
                    <Monitor size={16} />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-[#E8EEF7]">{session.device}</p>
                    {session.current && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-[rgba(0,214,143,0.12)] text-[#00D68F]">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#8BA3C7] flex items-center gap-1">
                    <Globe size={10} />
                    {session.location} · <Clock size={10} />
                    {formatDate(session.lastActive)}
                  </p>
                </div>
              </div>
              {!session.current && (
                <button
                  onClick={() => handleRevokeSession(session.id)}
                  className="text-[#8BA3C7] hover:text-[#FF4D6A] transition-colors p-1"
                  aria-label="Revoke session"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2FA status */}
      <div className="p-4 rounded-xl bg-[#050B14]/60 border border-[#162544]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock size={18} className="text-[#FFB020]" />
            <div>
              <p className="text-sm font-medium text-[#E8EEF7]">Two-Factor Authentication</p>
              <p className="text-xs text-[#8BA3C7]">Add an extra layer of security to your account</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[#FFB020] border-[#FFB020]/30">
            Coming Soon
          </Badge>
        </div>
      </div>

      {/* Login history */}
      <div>
        <h3 className="font-body text-sm font-semibold text-[#E8EEF7] mb-3">Login History</h3>
        <div className="space-y-2">
          {loginHistory.map((entry, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-lg bg-[#050B14]/60 border border-[#162544]"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-2 rounded-full ${
                    entry.status === 'success' ? 'bg-[#00D68F]' : 'bg-[#FF4D6A]'
                  }`}
                />
                <div>
                  <p className="text-sm text-[#E8EEF7]">{entry.device}</p>
                  <p className="text-xs text-[#8BA3C7]">
                    {entry.location} · {formatDate(entry.timestamp)}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={
                  entry.status === 'success'
                    ? 'text-[#00D68F] border-[#00D68F]/30'
                    : 'text-[#FF4D6A] border-[#FF4D6A]/30'
                }
              >
                {entry.status === 'success' ? 'Success' : 'Failed'}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Consent History Section */
function ConsentHistory() {
  const [history, setHistory] = useState<ConsentHistoryEntry[]>([]);

  useEffect(() => {
    const stored = secureStorage.get<ConsentHistoryEntry[]>('consent_history');
    if (stored && stored.length > 0) {
      setHistory(stored);
    } else {
      // Seed with default entries for demo
      const defaults: ConsentHistoryEntry[] = [
        {
          action: 'essential_only',
          timestamp: new Date(Date.now() - 30 * 86400000).toISOString(),
          categories: ['essential'],
        },
        {
          action: 'granted',
          timestamp: new Date(Date.now() - 25 * 86400000).toISOString(),
          categories: ['essential', 'analytics', 'functional'],
        },
      ];
      secureStorage.set('consent_history', defaults);
      setHistory(defaults);
    }
  }, []);

  const handleRevoke = (index: number) => {
    const entry = history[index];
    const newEntry: ConsentHistoryEntry = {
      action: `revoked_${entry.action}`,
      timestamp: new Date().toISOString(),
      categories: entry.categories,
    };
    const updated = [...history, newEntry];
    setHistory(updated);
    secureStorage.set('consent_history', updated);
  };

  if (history.length === 0) {
    return (
      <div className="p-8 rounded-xl bg-[#050B14]/60 border border-[#162544] text-center">
        <Cookie size={32} className="text-[#4A6180] mx-auto mb-3" />
        <p className="text-sm text-[#8BA3C7]">No consent history yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-[19px] top-2 bottom-2 w-[2px] bg-[#162544]" />

        <div className="space-y-4">
          {[...history].reverse().map((entry, i) => {
            const isRevoked = entry.action.startsWith('revoked');
            const originalIndex = history.length - 1 - i;

            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex items-start gap-4 pl-2"
              >
                {/* Dot */}
                <div
                  className={`w-3 h-3 rounded-full border-2 flex-shrink-0 mt-1.5 z-10 ${
                    isRevoked
                      ? 'border-[#FF4D6A] bg-[#FF4D6A]'
                      : entry.action === 'essential_only'
                        ? 'border-[#FFB020] bg-[#FFB020]'
                        : 'border-[#00D68F] bg-[#00D68F]'
                  }`}
                />

                {/* Content */}
                <div className="flex-1 min-w-0 p-3 rounded-lg bg-[#050B14]/60 border border-[#162544]">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-[#E8EEF7]">
                        {isRevoked ? (
                          <span className="text-[#FF4D6A]">Revoked</span>
                        ) : entry.action === 'essential_only' ? (
                          <span className="text-[#FFB020]">Essential Only</span>
                        ) : (
                          <span className="text-[#00D68F]">Consented</span>
                        )}
                      </p>
                      <p className="text-xs text-[#8BA3C7] mt-0.5">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                    {!isRevoked && (
                      <button
                        onClick={() => handleRevoke(originalIndex)}
                        className="text-[11px] text-[#8BA3C7] hover:text-[#FF4D6A] transition-colors flex items-center gap-1 flex-shrink-0"
                      >
                        <X size={10} />
                        Revoke
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {entry.categories.map((cat) => (
                      <Badge
                        key={cat}
                        variant="outline"
                        className="text-[10px] capitalize"
                        style={{
                          color: isRevoked ? '#FF4D6A' : '#8BA3C7',
                          borderColor: isRevoked ? 'rgba(255,77,106,0.3)' : 'rgba(139,163,199,0.3)',
                        }}
                      >
                        {cat}
                      </Badge>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

const SECTIONS: Array<{ id: SectionId; label: string; icon: ReactNode }> = [
  { id: 'controls', label: 'Privacy Controls', icon: <Shield size={18} /> },
  { id: 'data', label: 'Data Management', icon: <HardDrive size={18} /> },
  { id: 'security', label: 'Security', icon: <Lock size={18} /> },
  { id: 'consent', label: 'Consent History', icon: <History size={18} /> },
  { id: 'rights', label: 'Data Subject Rights', icon: <User size={18} /> },
];

export default function Privacy() {
  const [activeSection, setActiveSection] = useState<SectionId>('controls');

  return (
    <div className="min-h-screen bg-[#0B1628]">
      {/* Page header */}
      <div className="border-b border-[#162544] bg-[#0B1628]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-[rgba(75,130,255,0.15)] flex items-center justify-center">
                <Shield size={24} className="text-[#4B82FF]" />
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-[#E8EEF7]">
                  Privacy Settings
                </h1>
                <p className="text-sm text-[#8BA3C7]">
                  Manage your data, consent, and GDPR rights
                </p>
              </div>
            </div>
            <p className="text-xs text-[#4A6180] mt-2">
              Your data is encrypted at rest and in transit. We never sell your personal information.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="lg:w-64 flex-shrink-0"
          >
            <nav className="space-y-1 lg:sticky lg:top-24">
              {SECTIONS.map((section) => {
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-body text-sm transition-all duration-200 ${
                      isActive
                        ? 'bg-[rgba(75,130,255,0.12)] text-[#4B82FF] font-medium'
                        : 'text-[#8BA3C7] hover:text-[#E8EEF7] hover:bg-[#162544]/30'
                    }`}
                  >
                    <span className={isActive ? 'text-[#4B82FF]' : 'text-[#4A6180]'}>
                      {section.icon}
                    </span>
                    {section.label}
                    {isActive && (
                      <motion.div
                        layoutId="privacy-nav-indicator"
                        className="ml-auto w-1 h-1 rounded-full bg-[#4B82FF]"
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          </motion.aside>

          {/* Main content */}
          <main className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeSection === 'controls' && (
                <motion.div
                  key="controls"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-xl font-semibold text-[#E8EEF7] mb-1">
                    Privacy Controls
                  </h2>
                  <p className="text-sm text-[#8BA3C7] mb-6">
                    Control how your data is used and who can see your activity.
                  </p>
                  <PrivacyControls />
                </motion.div>
              )}

              {activeSection === 'data' && (
                <motion.div
                  key="data"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-xl font-semibold text-[#E8EEF7] mb-1">
                    Data Management
                  </h2>
                  <p className="text-sm text-[#8BA3C7] mb-6">
                    Manage storage, retention, and deletion of your data.
                  </p>
                  <DataManagement />
                </motion.div>
              )}

              {activeSection === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-xl font-semibold text-[#E8EEF7] mb-1">
                    Security
                  </h2>
                  <p className="text-sm text-[#8BA3C7] mb-6">
                    Active sessions, two-factor authentication, and login history.
                  </p>
                  <SecuritySection />
                </motion.div>
              )}

              {activeSection === 'consent' && (
                <motion.div
                  key="consent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <h2 className="font-display text-xl font-semibold text-[#E8EEF7] mb-1">
                    Consent History
                  </h2>
                  <p className="text-sm text-[#8BA3C7] mb-6">
                    Timeline of all your consent actions. You can revoke individual consents.
                  </p>
                  <ConsentHistory />
                </motion.div>
              )}

              {activeSection === 'rights' && (
                <motion.div
                  key="rights"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <DataSubjectRights />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
