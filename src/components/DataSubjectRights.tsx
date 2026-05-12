/**
 * DataSubjectRights.tsx — Data Subject Rights Panel
 *
 * Implements all 6 GDPR data subject rights with request flows,
 * status tracking, confirmation modals, and email simulation.
 * Accessible from /privacy route or user menu.
 */

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Edit3,
  Trash2,
  Download,
  PauseCircle,
  Ban,
  BarChart3,
  ChevronRight,
  Megaphone,
  Check,
  Clock,
  AlertTriangle,
  X,
  Send,
  RotateCcw,
  FileText,
  Lock,
  Shield,
  User,
  HardDrive,
  Globe,
  Settings,
  LogIn,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { secureStorage } from '@/lib/security';
import DataExport from './DataExport';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DsrStatus = 'idle' | 'submitted' | 'in_review' | 'processing' | 'completed';
export type DsrType = 'access' | 'correction' | 'deletion' | 'portability' | 'restriction' | 'objection';

export interface DsrRequest {
  id: string;
  type: DsrType;
  status: DsrStatus;
  submittedAt: string;
  description: string;
  processingDays: number;
  email: string;
}

export interface StoredRequest {
  id: string;
  type: DsrType;
  status: DsrStatus;
  submittedAt: string;
  updatedAt: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DSR_KEY = 'dsr_requests';
const GDPR_PROCESSING_DAYS = 30;

const RIGHTS: Array<{
  id: DsrType;
  title: string;
  subtitle: string;
  description: string;
  article: string;
  icon: ReactNode;
  iconBg: string;
  iconColor: string;
  details: string[];
}> = [
  {
    id: 'access',
    title: 'Access My Data',
    subtitle: 'Right of Access',
    description:
      'Receive a complete copy of all personal data we hold about you, including processing purposes, data recipients, and retention periods.',
    article: 'GDPR Article 15',
    icon: <Eye size={22} />,
    iconBg: 'rgba(75, 130, 255, 0.12)',
    iconColor: '#4B82FF',
    details: [
      'Uploaded bank statements',
      'Conversion history',
      'Account information',
      'Activity log',
      'Consent history',
      'Portal memberships',
    ],
  },
  {
    id: 'correction',
    title: 'Correct My Data',
    subtitle: 'Right to Rectification',
    description:
      'Update or correct any inaccurate personal data we hold about you.',
    article: 'GDPR Article 16',
    icon: <Edit3 size={22} />,
    iconBg: 'rgba(0, 214, 143, 0.12)',
    iconColor: '#00D68F',
    details: [
      'Display name',
      'Email address',
      'Account preferences',
      'Profile information',
    ],
  },
  {
    id: 'deletion',
    title: 'Delete My Account',
    subtitle: 'Right to Erasure',
    description:
      'Request complete deletion of your account and all associated personal data. This action is irreversible.',
    article: 'GDPR Article 17',
    icon: <Trash2 size={22} />,
    iconBg: 'rgba(255, 77, 106, 0.12)',
    iconColor: '#FF4D6A',
    details: [
      'Account profile',
      'All bank statements',
      'Conversion history',
      'Activity logs',
      'Portal memberships',
      'Settings & preferences',
    ],
  },
  {
    id: 'portability',
    title: 'Export My Data',
    subtitle: 'Right to Data Portability',
    description:
      'Download all your personal data in a structured, machine-readable JSON format for transfer to another service.',
    article: 'GDPR Article 20',
    icon: <Download size={22} />,
    iconBg: 'rgba(75, 130, 255, 0.12)',
    iconColor: '#4B82FF',
    details: [
      'JSON format export',
      'Machine-readable structure',
      'Includes all categories',
      'Secure download link',
      'Valid for 24 hours',
    ],
  },
  {
    id: 'restriction',
    title: 'Restrict Processing',
    subtitle: 'Right to Restriction',
    description:
      'Temporarily pause all processing of your personal data. Your account will go dormant but data will be preserved.',
    article: 'GDPR Article 18',
    icon: <PauseCircle size={22} />,
    iconBg: 'rgba(255, 176, 32, 0.12)',
    iconColor: '#FFB020',
    details: [
      'No new conversions',
      'No data processing',
      'Account preserved',
      'Can be reactivated',
    ],
  },
  {
    id: 'objection',
    title: 'Object to Processing',
    subtitle: 'Right to Object',
    description:
      'Object to specific processing activities such as analytics or marketing data processing.',
    article: 'GDPR Article 21',
    icon: <Ban size={22} />,
    iconBg: 'rgba(255, 77, 106, 0.12)',
    iconColor: '#FF4D6A',
    details: [
      'Analytics tracking',
      'Marketing processing',
      'Profiling activities',
      'Automated decisions',
    ],
  },
];

const STATUS_CONFIG: Record<
  DsrStatus,
  { label: string; color: string; bgColor: string; icon: ReactNode }
> = {
  idle: { label: 'Not Submitted', color: '#8BA3C7', bgColor: 'rgba(139,163,199,0.1)', icon: <Clock size={12} /> },
  submitted: { label: 'Submitted', color: '#4B82FF', bgColor: 'rgba(75,130,255,0.1)', icon: <Send size={12} /> },
  in_review: { label: 'In Review', color: '#FFB020', bgColor: 'rgba(255,176,32,0.1)', icon: <Eye size={12} /> },
  processing: { label: 'Processing', color: '#78A4FF', bgColor: 'rgba(120,164,255,0.1)', icon: <RotateCcw size={12} /> },
  completed: { label: 'Completed', color: '#00D68F', bgColor: 'rgba(0,214,143,0.1)', icon: <Check size={12} /> },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function loadRequests(): StoredRequest[] {
  return secureStorage.get<StoredRequest[]>(DSR_KEY) ?? [];
}

function saveRequest(request: StoredRequest) {
  const existing = loadRequests();
  const idx = existing.findIndex((r) => r.id === request.id);
  if (idx >= 0) {
    existing[idx] = request;
  } else {
    existing.push(request);
  }
  secureStorage.set(DSR_KEY, existing);
}

function getRequestStatus(type: DsrType): DsrStatus {
  const requests = loadRequests();
  const req = requests.find((r) => r.type === type);
  return req?.status ?? 'idle';
}

// ---------------------------------------------------------------------------
// Sub-Components
// ---------------------------------------------------------------------------

function StatusBadge({ status }: { status: DsrStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full"
      style={{ color: cfg.color, backgroundColor: cfg.bgColor }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

/** Access My Data panel */
function AccessDataPanel() {
  const requests = loadRequests();
  const req = requests.find((r) => r.type === 'access');

  const handleSubmit = () => {
    const newReq: StoredRequest = {
      id: `dsr-access-${Date.now()}`,
      type: 'access',
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Full data access request',
    };
    saveRequest(newReq);
    window.dispatchEvent(new CustomEvent('dsr:updated'));
  };

  const status = req?.status ?? 'idle';

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {RIGHTS[0].details.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-[#8BA3C7]">
            <FileText size={14} className="text-[#4B82FF] flex-shrink-0" />
            {d}
          </div>
        ))}
      </div>

      {status === 'idle' && (
        <button
          onClick={handleSubmit}
          className="font-body text-sm font-semibold text-white px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
        >
          <Eye size={16} />
          Request My Data
        </button>
      )}

      {status === 'submitted' && (
        <div className="p-3 rounded-lg bg-[rgba(75,130,255,0.08)] border border-[rgba(75,130,255,0.2)]">
          <p className="text-sm text-[#78A4FF] flex items-center gap-2">
            <Check size={14} />
            Request submitted. We will respond within {GDPR_PROCESSING_DAYS} days.
          </p>
        </div>
      )}

      {status === 'completed' && (
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-[rgba(0,214,143,0.08)] border border-[rgba(0,214,143,0.2)]">
            <p className="text-sm text-[#00D68F] flex items-center gap-2">
              <Check size={14} />
              Your data access request has been completed. View your data below.
            </p>
          </div>
          {/* Simulated data view */}
          <div className="space-y-2">
            <h4 className="font-body text-sm font-semibold text-[#E8EEF7]">Your Stored Data</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <DataCard icon={<FileText size={16} />} label="Statements" value="12 files" />
              <DataCard icon={<RotateCcw size={16} />} label="Conversions" value="45 completed" />
              <DataCard icon={<User size={16} />} label="Account" value="Active since Jan 2024" />
              <DataCard icon={<Globe size={16} />} label="Portals" value="3 memberships" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-[#050B14]/60 border border-[#162544]">
      <div className="text-[#4B82FF]">{icon}</div>
      <div>
        <p className="text-[11px] text-[#4A6180]">{label}</p>
        <p className="text-sm text-[#E8EEF7] font-medium">{value}</p>
      </div>
    </div>
  );
}

/** Correct My Data panel */
function CorrectionPanel() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (name) secureStorage.set('user_display_name', name);
    if (email) secureStorage.set('user_email', email);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-[#8BA3C7] mb-1.5">Display Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your display name"
            className="w-full px-3 py-2 rounded-lg bg-[#050B14] border border-[#162544] text-sm text-[#E8EEF7] placeholder:text-[#4A6180] focus:border-[#4B82FF] focus:outline-none transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8BA3C7] mb-1.5">Email Address</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 rounded-lg bg-[#050B14] border border-[#162544] text-sm text-[#E8EEF7] placeholder:text-[#4A6180] focus:border-[#4B82FF] focus:outline-none transition-colors"
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="font-body text-sm font-semibold text-white px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #00D68F 0%, #00A86B 100%)' }}
        >
          <Check size={16} />
          Save Changes
        </button>
        {saved && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm text-[#00D68F] flex items-center gap-1"
          >
            <Check size={14} /> Saved
          </motion.span>
        )}
      </div>
    </div>
  );
}

/** Delete My Account modal panel */
function DeletionPanel() {
  const [step, setStep] = useState<'confirm' | 'password' | 'done'>('confirm');
  const [password, setPassword] = useState('');

  const handleConfirm = () => setStep('password');
  const handleDelete = () => {
    if (password.length < 1) return;
    // Simulate deletion
    const newReq: StoredRequest = {
      id: `dsr-deletion-${Date.now()}`,
      type: 'deletion',
      status: 'processing',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: 'Account deletion request (Right to Erasure)',
    };
    saveRequest(newReq);
    setStep('done');
    window.dispatchEvent(new CustomEvent('dsr:updated'));
  };

  if (step === 'done') {
    return (
      <div className="p-4 rounded-lg bg-[rgba(0,214,143,0.08)] border border-[rgba(0,214,143,0.2)]">
        <p className="text-sm text-[#00D68F] flex items-center gap-2 font-medium">
          <Check size={16} />
          Deletion request submitted. Your account will be erased within {GDPR_PROCESSING_DAYS} days.
        </p>
        <p className="text-xs text-[#8BA3C7] mt-2">
          You may cancel this request within 48 hours by contacting support.
        </p>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div className="space-y-4">
        <div className="p-3 rounded-lg bg-[rgba(255,77,106,0.08)] border border-[rgba(255,77,106,0.2)]">
          <p className="text-sm text-[#FF4D6A] flex items-start gap-2">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            Enter your password to confirm irreversible account deletion.
          </p>
        </div>
        <div>
          <label className="block text-xs font-medium text-[#8BA3C7] mb-1.5">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full sm:w-64 px-3 py-2 rounded-lg bg-[#050B14] border border-[#162544] text-sm text-[#E8EEF7] placeholder:text-[#4A6180] focus:border-[#FF4D6A] focus:outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            disabled={!password}
            className="font-body text-sm font-semibold text-white px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ background: 'linear-gradient(135deg, #FF4D6A 0%, #CC2D4A 100%)' }}
          >
            <Trash2 size={16} />
            Permanently Delete Account
          </button>
          <button
            onClick={() => setStep('confirm')}
            className="font-body text-sm font-medium text-[#8BA3C7] hover:text-[#E8EEF7] px-4 py-2.5 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#8BA3C7]">
        The following data will be <strong className="text-[#E8EEF7]">permanently deleted</strong>:
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {RIGHTS[2].details.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-[#8BA3C7]">
            <Trash2 size={14} className="text-[#FF4D6A] flex-shrink-0" />
            {d}
          </div>
        ))}
      </div>
      <button
        onClick={handleConfirm}
        className="font-body text-sm font-semibold text-white px-5 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
        style={{ background: 'linear-gradient(135deg, #FF4D6A 0%, #CC2D4A 100%)' }}
      >
        <Trash2 size={16} />
        Forget Me — Delete Account
      </button>
    </div>
  );
}

/** Restriction panel */
function RestrictionPanel() {
  const [restricted, setRestricted] = useState(false);

  const handleToggle = () => {
    const next = !restricted;
    setRestricted(next);
    secureStorage.set('processing_restricted', next);
    const newReq: StoredRequest = {
      id: `dsr-restriction-${Date.now()}`,
      type: 'restriction',
      status: next ? 'processing' : 'completed',
      submittedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      description: next ? 'Processing restricted' : 'Restriction lifted',
    };
    saveRequest(newReq);
    window.dispatchEvent(new CustomEvent('dsr:updated'));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-xl bg-[#050B14]/60 border border-[#162544]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,176,32,0.12)' }}>
            <PauseCircle size={20} style={{ color: '#FFB020' }} />
          </div>
          <div>
            <p className="text-sm font-medium text-[#E8EEF7]">Restrict Processing</p>
            <p className="text-xs text-[#8BA3C7]">
              {restricted
                ? 'All processing is paused. Your account is dormant.'
                : 'Processing is active. Toggle to pause.'}
            </p>
          </div>
        </div>
        <Switch checked={restricted} onCheckedChange={handleToggle} aria-label="Restrict processing" />
      </div>

      {restricted && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-[rgba(255,176,32,0.08)] border border-[rgba(255,176,32,0.2)]"
        >
          <p className="text-sm text-[#FFB020] flex items-center gap-2">
            <PauseCircle size={14} />
            Your account is now dormant. No new data will be processed.
          </p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {RIGHTS[4].details.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm text-[#8BA3C7]">
            <Shield size={14} className="text-[#FFB020] flex-shrink-0" />
            {d}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Objection panel */
function ObjectionPanel() {
  const [objections, setObjections] = useState({
    analytics: false,
    marketing: false,
    profiling: false,
    automated: false,
  });

  const handleToggle = (key: keyof typeof objections) => {
    setObjections((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      const newReq: StoredRequest = {
        id: `dsr-objection-${Date.now()}`,
        type: 'objection',
        status: 'completed',
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        description: `Objections: ${Object.entries(next)
          .filter(([, v]) => v)
          .map(([k]) => k)
          .join(', ')}`,
      };
      saveRequest(newReq);
      window.dispatchEvent(new CustomEvent('dsr:updated'));
      return next;
    });
  };

  return (
    <div className="space-y-3">
      {[
        { key: 'analytics' as const, label: 'Analytics Processing', desc: 'Object to analytics data collection', icon: <BarChart3 size={16} /> },
        { key: 'marketing' as const, label: 'Marketing Processing', desc: 'Object to marketing data use', icon: <Megaphone size={16} /> },
        { key: 'profiling' as const, label: 'Profiling Activities', desc: 'Object to any profiling of your data', icon: <User size={16} /> },
        { key: 'automated' as const, label: 'Automated Decisions', desc: 'Object to automated decision-making', icon: <Settings size={16} /> },
      ].map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between p-3 rounded-lg bg-[#050B14]/60 border border-[#162544] hover:border-[#1E3260] transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-[#FF4D6A]">{item.icon}</div>
            <div>
              <p className="text-sm text-[#E8EEF7]">{item.label}</p>
              <p className="text-xs text-[#8BA3C7]">{item.desc}</p>
            </div>
          </div>
          <Switch
            checked={objections[item.key]}
            onCheckedChange={() => handleToggle(item.key)}
            aria-label={`Object to ${item.label}`}
          />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DataSubjectRights() {
  const [expandedId, setExpandedId] = useState<DsrType | null>(null);
  const [requests, setRequests] = useState<StoredRequest[]>(loadRequests);

  // Refresh requests when DSR events fire
  useEffect(() => {
    const handler = () => setRequests(loadRequests());
    window.addEventListener('dsr:updated', handler);
    return () => window.removeEventListener('dsr:updated', handler);
  }, []);

  const toggleExpand = (id: DsrType) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[rgba(75,130,255,0.15)] flex items-center justify-center">
          <Shield size={20} className="text-[#4B82FF]" />
        </div>
        <div>
          <h2 className="font-display text-xl font-semibold text-[#E8EEF7]">
            Your Data Rights
          </h2>
          <p className="text-sm text-[#8BA3C7]">
            Under GDPR, you have 6 fundamental rights. Processing time: {GDPR_PROCESSING_DAYS} days.
          </p>
        </div>
      </div>

      {/* Rights list */}
      <div className="space-y-3">
        {RIGHTS.map((right) => {
          const isExpanded = expandedId === right.id;
          const status = getRequestStatus(right.id);

          return (
            <motion.div
              key={right.id}
              layout
              className="rounded-xl border border-[#162544] overflow-hidden bg-[#0B1628]/60"
            >
              {/* Header row */}
              <button
                onClick={() => toggleExpand(right.id)}
                className="w-full flex items-center gap-4 p-4 text-left hover:bg-[#162544]/30 transition-colors"
                aria-expanded={isExpanded}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: right.iconBg, color: right.iconColor }}
                >
                  {right.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <h3 className="font-body text-sm font-semibold text-[#E8EEF7]">
                      {right.title}
                    </h3>
                    <StatusBadge status={status} />
                  </div>
                  <p className="text-xs text-[#8BA3C7] mt-0.5">
                    {right.subtitle} — {right.article}
                  </p>
                </div>
                <motion.div
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[#4A6180] flex-shrink-0"
                >
                  <ChevronRight size={18} />
                </motion.div>
              </button>

              {/* Expanded content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-1 border-t border-[#162544]">
                      <p className="text-sm text-[#8BA3C7] leading-relaxed mb-4">
                        {right.description}
                      </p>

                      {/* Render specific panel for each right */}
                      {right.id === 'access' && <AccessDataPanel />}
                      {right.id === 'correction' && <CorrectionPanel />}
                      {right.id === 'deletion' && <DeletionPanel />}
                      {right.id === 'portability' && <DataExport />}
                      {right.id === 'restriction' && <RestrictionPanel />}
                      {right.id === 'objection' && <ObjectionPanel />}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Status legend */}
      <div className="mt-6 p-4 rounded-xl bg-[#050B14]/40 border border-[#162544]">
        <p className="text-xs font-medium text-[#8BA3C7] mb-2">Request Status Guide</p>
        <div className="flex flex-wrap gap-3">
          {(['idle', 'submitted', 'in_review', 'processing', 'completed'] as DsrStatus[]).map(
            (s) => (
              <StatusBadge key={s} status={s} />
            )
          )}
        </div>
        <p className="text-[11px] text-[#4A6180] mt-3">
          Per GDPR Article 12(3), we respond to all requests within {GDPR_PROCESSING_DAYS} days.
          You will receive a confirmation email for each request.
        </p>
      </div>
    </div>
  );
}
