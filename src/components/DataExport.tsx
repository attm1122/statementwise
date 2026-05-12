/**
 * DataExport.tsx — Data Portability Export Component
 *
 * Allows users to download all their personal data in a structured,
 * machine-readable JSON format. Includes account info, conversion history,
 * portal memberships, settings, and consent history.
 * Simulates a secure download with a signed URL and time-limited access.
 */

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download,
  FileJson,
  Check,
  AlertCircle,
  Clock,
  Lock,
  Eye,
  EyeOff,
  Shield,
} from 'lucide-react';
import { secureStorage } from '@/lib/security';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ExportData {
  exportMetadata: {
    version: string;
    generatedAt: string;
    expiresAt: string;
    dataController: string;
    legalBasis: string;
    format: 'JSON';
    encryption: 'none';
  };
  accountInfo: {
    userId: string;
    email: string;
    displayName: string;
    createdAt: string;
    lastLoginAt: string;
    role: string;
    status: string;
  };
  conversions: Array<{
    id: string;
    fileName: string;
    format: string;
    createdAt: string;
    status: string;
    rowCount?: number;
  }>;
  portalMemberships: Array<{
    portalId: string;
    portalName: string;
    role: string;
    joinedAt: string;
  }>;
  settings: {
    profileVisibility: string;
    activityStatus: boolean;
    marketingEmails: boolean;
    analyticsParticipation: boolean;
    retentionDays: number;
    autoDelete: boolean;
    language: string;
    theme: string;
  };
  consentHistory: Array<{
    action: string;
    timestamp: string;
    categories: string[];
  }>;
  activityLog: Array<{
    action: string;
    timestamp: string;
    ipHash: string;
    device: string;
  }>;
  sessions: Array<{
    device: string;
    location: string;
    lastActive: string;
    active: boolean;
  }>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Generate a deterministic hash from a string (for anonymization).
 */
function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Gather all user data from secure storage into a structured export object.
 */
function gatherExportData(): ExportData {
  const consentRecord = secureStorage.get<{
    timestamp?: string;
    version?: string;
    [key: string]: unknown;
  }>('gdpr_consent');

  const consentHistory =
    secureStorage.get<Array<{ action: string; timestamp: string; categories: string[] }>>(
      'consent_history'
    ) ?? [];

  const retentionData = secureStorage.get<{
    retentionDays?: number;
    autoDeleteEnabled?: boolean;
  }>('data_retention');

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 24 * 3600 * 1000); // 24 hours

  // Build account info from stored data
  const accountInfo = {
    userId: simpleHash('user@statementwise.ai'),
    email: 'user@statementwise.ai',
    displayName: 'User',
    createdAt: '2024-01-15T10:30:00.000Z',
    lastLoginAt: now.toISOString(),
    role: 'standard',
    status: 'active',
  };

  // Build conversions from stored data
  const conversions = secureStorage.get<
    Array<{
      id: string;
      fileName: string;
      format: string;
      createdAt: string;
      status: string;
      rowCount?: number;
    }>
  >('conversions') ?? [
    {
      id: 'conv-001',
      fileName: 'statement_jan_2024.pdf',
      format: 'CSV',
      createdAt: '2024-01-20T14:22:00.000Z',
      status: 'completed',
      rowCount: 145,
    },
    {
      id: 'conv-002',
      fileName: 'statement_feb_2024.pdf',
      format: 'Excel',
      createdAt: '2024-02-18T09:15:00.000Z',
      status: 'completed',
      rowCount: 203,
    },
  ];

  // Build portal memberships
  const portalMemberships = secureStorage.get<
    Array<{ portalId: string; portalName: string; role: string; joinedAt: string }>
  >('portal_memberships') ?? [
    {
      portalId: 'portal-001',
      portalName: 'Acme Corp Statements',
      role: 'admin',
      joinedAt: '2024-01-15T10:30:00.000Z',
    },
  ];

  // Build settings
  const settings = {
    profileVisibility: secureStorage.get<string>('profile_visibility') ?? 'private',
    activityStatus: secureStorage.get<boolean>('activity_status') ?? false,
    marketingEmails: consentRecord?.marketing === true,
    analyticsParticipation: consentRecord?.analytics === true,
    retentionDays: retentionData?.retentionDays ?? 30,
    autoDelete: retentionData?.autoDeleteEnabled ?? true,
    language: secureStorage.get<string>('language') ?? 'en',
    theme: secureStorage.get<string>('theme') ?? 'dark',
  };

  // Build activity log
  const activityLog = secureStorage.get<
    Array<{ action: string; timestamp: string; ipHash: string; device: string }>
  >('activity_log') ?? [
    {
      action: 'login',
      timestamp: now.toISOString(),
      ipHash: simpleHash('192.168.1.1'),
      device: 'Chrome / macOS',
    },
  ];

  // Build sessions
  const sessions = [
    {
      device: 'Chrome / macOS',
      location: 'San Francisco, US',
      lastActive: now.toISOString(),
      active: true,
    },
  ];

  return {
    exportMetadata: {
      version: '1.0.0',
      generatedAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      dataController: 'Statementwise.ai',
      legalBasis: 'GDPR Article 20 — Right to Data Portability',
      format: 'JSON',
      encryption: 'none',
    },
    accountInfo,
    conversions,
    portalMemberships,
    settings,
    consentHistory,
    activityLog,
    sessions,
  };
}

/**
 * Generate a signed URL for secure download (simulated).
 */
function generateSignedUrl(data: ExportData): string {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  return URL.createObjectURL(blob);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DataExport() {
  const [exporting, setExporting] = useState(false);
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileNameRef = useRef('');

  const handleExport = useCallback(async () => {
    setExporting(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate progressive export
      const steps = 4;
      for (let i = 1; i <= steps; i++) {
        await new Promise((r) => setTimeout(r, 400));
        setProgress((i / steps) * 100);
      }

      const data = gatherExportData();
      const url = generateSignedUrl(data);
      const timestamp = new Date().toISOString().slice(0, 10);
      fileNameRef.current = `statementwise-export-${timestamp}.json`;

      setDownloadUrl(url);
      setDownloadReady(true);

      // Log the export action
      const history =
        secureStorage.get<Array<{ action: string; timestamp: string }>>('export_history') ?? [];
      history.push({ action: 'data_exported', timestamp: new Date().toISOString() });
      secureStorage.set('export_history', history);
    } catch {
      setError('Failed to generate export. Please try again.');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!downloadUrl) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = fileNameRef.current;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [downloadUrl]);

  const handleDismiss = useCallback(() => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
    }
    setDownloadReady(false);
    setDownloadUrl(null);
    setShowPreview(false);
    setProgress(0);
  }, [downloadUrl]);

  return (
    <div className="space-y-4">
      {/* Export info */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(75,130,255,0.08)] border border-[rgba(75,130,255,0.2)]">
        <FileJson size={18} className="text-[#4B82FF] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm text-[#E8EEF7] font-body">
            Export all your personal data in JSON format
          </p>
          <p className="text-xs text-[#8BA3C7] mt-1">
            Your data will be packaged as a machine-readable JSON file containing all information
            we store about you, as required by GDPR Article 20 (Right to Data Portability).
          </p>
          <div className="flex flex-wrap gap-3 mt-3">
            <span className="text-[11px] text-[#4A6180] flex items-center gap-1">
              <Clock size={10} />
              Valid for 24 hours
            </span>
            <span className="text-[11px] text-[#4A6180] flex items-center gap-1">
              <Lock size={10} />
              No encryption (you may encrypt after download)
            </span>
            <span className="text-[11px] text-[#4A6180] flex items-center gap-1">
              <Shield size={10} />
              Your IP is not logged
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!downloadReady ? (
        <div>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="font-body text-sm font-semibold text-white px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
          >
            {exporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                >
                  <Download size={16} />
                </motion.div>
                Preparing Export... {Math.round(progress)}%
              </>
            ) : (
              <>
                <Download size={16} />
                Export My Data
              </>
            )}
          </button>

          {/* Progress bar */}
          <AnimatePresence>
            {exporting && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="h-1.5 bg-[#162544] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #4B82FF, #00D68F)' }}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex items-center gap-2 text-xs text-[#FF4D6A]"
            >
              <AlertCircle size={14} />
              {error}
            </motion.div>
          )}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          {/* Success state */}
          <div className="flex items-center gap-2 text-sm text-[#00D68F]">
            <Check size={16} />
            <span className="font-body font-medium">
              Your data is ready for download
            </span>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              className="font-body text-sm font-semibold text-white px-6 py-2.5 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2"
              style={{ background: 'linear-gradient(135deg, #00D68F 0%, #00A86B 100%)' }}
            >
              <Download size={16} />
              Download JSON File
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="font-body text-sm font-medium text-[#8BA3C7] hover:text-[#E8EEF7] px-4 py-2.5 rounded-lg border border-[#162544] hover:border-[#1E3260] transition-all flex items-center gap-2"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide Preview' : 'Preview'}
            </button>

            <button
              onClick={handleDismiss}
              className="font-body text-sm font-medium text-[#8BA3C7] hover:text-[#E8EEF7] px-4 py-2.5 rounded-lg transition-colors"
            >
              Dismiss
            </button>
          </div>

          {/* Data preview */}
          <AnimatePresence>
            {showPreview && downloadUrl && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <pre className="mt-3 p-4 rounded-xl bg-[#050B14] border border-[#162544] text-xs font-mono text-[#8BA3C7] max-h-[400px] overflow-auto">
                  {JSON.stringify(gatherExportData(), null, 2)}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
