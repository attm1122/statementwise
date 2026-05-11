import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileUp,
  FileCheck,
  X,
  Loader2,
  CheckCircle2,
  Circle,
  Sparkles,
  Search,
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  FileCode,
  FileText,
  RotateCcw,
  ArrowLeftRight,
  ArrowDownLeft,
  ArrowUpRight,
  MoreHorizontal,
  HelpCircle,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type Phase = 'upload' | 'extracting' | 'review' | 'export';

interface Transaction {
  id: number;
  date: string;
  description: string;
  type: 'Deposit' | 'Withdrawal' | 'Transfer';
  amount: number;
  balance: number;
  confidence: number;
}

interface ExtractionStep {
  label: string;
  detail: string;
  status: 'pending' | 'processing' | 'complete';
}

interface SortConfig {
  key: keyof Transaction | null;
  direction: 'asc' | 'desc';
}

/* ------------------------------------------------------------------ */
/*  Mock Data                                                          */
/* ------------------------------------------------------------------ */

const OPENING_BALANCE = 5240.0;

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, date: '04/01/2025', description: 'PAYROLL DEPOSIT — ACME CORPORATION', type: 'Deposit', amount: 4250.0, balance: 9490.0, confidence: 99 },
  { id: 2, date: '04/02/2025', description: 'SHELL OIL 5744 — HOUSTON TX', type: 'Withdrawal', amount: 45.5, balance: 9444.5, confidence: 97 },
  { id: 3, date: '04/02/2025', description: 'AMAZON.COM AMZN.COM/BILL', type: 'Withdrawal', amount: 127.99, balance: 9316.51, confidence: 99 },
  { id: 4, date: '04/03/2025', description: 'DIRECT DEPOSIT — FREELANCE WORK', type: 'Deposit', amount: 1850.0, balance: 11166.51, confidence: 98 },
  { id: 5, date: '04/03/2025', description: 'STARBUCKS #2034 — SEATTLE WA', type: 'Withdrawal', amount: 6.45, balance: 11160.06, confidence: 95 },
  { id: 6, date: '04/04/2025', description: 'NETFLIX.COM NETFLIX.COM', type: 'Withdrawal', amount: 15.49, balance: 11144.57, confidence: 99 },
  { id: 7, date: '04/04/2025', description: 'UBER TRIP HELP.UBER.COM', type: 'Withdrawal', amount: 24.75, balance: 11119.82, confidence: 97 },
  { id: 8, date: '04/05/2025', description: 'TRANSFER FROM SAVINGS XXXXXX4521', type: 'Transfer', amount: 1000.0, balance: 12119.82, confidence: 98 },
  { id: 9, date: '04/06/2025', description: 'GROCERY OUTLET MARKET #12', type: 'Withdrawal', amount: 89.34, balance: 12030.48, confidence: 96 },
  { id: 10, date: '04/06/2025', description: 'ATM WITHDRAWAL #4521', type: 'Withdrawal', amount: 200.0, balance: 11830.48, confidence: 99 },
  { id: 11, date: '04/07/2025', description: 'SPOTIFY USA SPOTIFY.COM', type: 'Withdrawal', amount: 9.99, balance: 11820.49, confidence: 99 },
  { id: 12, date: '04/07/2025', description: 'CHECK #1042 DEPOSITED', type: 'Deposit', amount: 1200.0, balance: 13020.49, confidence: 95 },
  { id: 13, date: '04/08/2025', description: 'WHOLE FOODS MKT #10283', type: 'Withdrawal', amount: 67.12, balance: 12953.37, confidence: 97 },
  { id: 14, date: '04/08/2025', description: 'PAYROLL DEPOSIT — ACME CORPORATION', type: 'Deposit', amount: 4250.0, balance: 17203.37, confidence: 99 },
  { id: 15, date: '04/09/2025', description: 'ELECTRIC COMPANY AUTOPAY', type: 'Withdrawal', amount: 142.67, balance: 17060.7, confidence: 98 },
  { id: 16, date: '04/10/2025', description: 'ZELLE TRANSFER TO JOHN DOE', type: 'Withdrawal', amount: 350.0, balance: 16710.7, confidence: 96 },
  { id: 17, date: '04/10/2025', description: 'INTEREST EARNED', type: 'Deposit', amount: 2.15, balance: 16712.85, confidence: 99 },
  { id: 18, date: '04/11/2025', description: 'HOME DEPOT #4721', type: 'Withdrawal', amount: 234.56, balance: 16478.29, confidence: 97 },
  { id: 19, date: '04/11/2025', description: 'VENMO PAYMENT JANE SMITH', type: 'Withdrawal', amount: 78.5, balance: 16399.79, confidence: 94 },
  { id: 20, date: '04/12/2025', description: 'WIRE TRANSFER — INTL PAYMENT', type: 'Withdrawal', amount: 1200.0, balance: 15199.79, confidence: 93 },
];

const BANK_PILLS = ['Chase', 'Bank of America', 'Wells Fargo', 'Citi', 'HSBC', 'Barclays', 'Deutsche Bank', '+1000s more'];

const EXPORT_FORMATS = [
  { key: 'csv' as const, label: 'CSV', desc: 'Spreadsheet', icon: FileText, size: '~12 KB' },
  { key: 'excel' as const, label: 'Excel', desc: 'XLSX format', icon: FileSpreadsheet, size: '~24 KB' },
  { key: 'qbo' as const, label: 'QBO', desc: 'QuickBooks', icon: FileCode, size: '~18 KB' },
  { key: 'ofx' as const, label: 'OFX', desc: 'Open Financial', icon: FileCode, size: '~16 KB' },
  { key: 'json' as const, label: 'JSON', desc: 'Developer format', icon: FileCode, size: '~32 KB' },
];

const INITIAL_STEPS: ExtractionStep[] = [
  { label: 'Parsing PDF structure...', detail: 'Identifying tables and text regions', status: 'pending' },
  { label: 'Detecting bank format...', detail: 'Analyzing layout patterns', status: 'pending' },
  { label: 'Extracting transactions with AI...', detail: 'Running neural extraction models', status: 'pending' },
  { label: 'Validating balance reconciliation...', detail: 'Cross-referencing running totals', status: 'pending' },
  { label: 'Finalizing output...', detail: 'Preparing structured data', status: 'pending' },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

const formatDate = (d: string) => d;

const easeOutExpo = [0.16, 1, 0.3, 1] as [number, number, number, number];

const pageTransition = {
  initial: { opacity: 0, x: 30 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -30 },
  transition: { duration: 0.5, ease: easeOutExpo },
};

/* ------------------------------------------------------------------ */
/*  Phase 1: Upload Zone                                               */
/* ------------------------------------------------------------------ */

function UploadPhase({ onFileSelect }: { onFileSelect: () => void }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<{ name: string; size: string; pages: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    setFile({ name: 'Chase_Bank_Statement_April2025.pdf', size: '2.4 MB', pages: 4 });
  }, []);

  const handleBrowse = () => inputRef.current?.click();

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setFile({ name: e.target.files[0].name, size: '2.4 MB', pages: 4 });
    }
  };

  const handleConvert = () => onFileSelect();

  const removeFile = () => setFile(null);

  return (
    <motion.div
      key="upload"
      {...pageTransition}
      className="w-full max-w-[720px] mx-auto flex flex-col items-center"
      style={{ minHeight: 'calc(70vh - 72px)' }}
    >
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo }}
        className="font-display text-3xl sm:text-4xl md:text-[44px] font-medium text-[#E8EEF7] text-center tracking-tight"
        style={{ lineHeight: 1.12 }}
      >
        Convert Bank Statement
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.1 }}
        className="mt-3 text-lg text-[#8BA3C7] text-center max-w-md"
        style={{ lineHeight: 1.65 }}
      >
        Drag and drop your PDF, or click to browse. We accept any bank format.
      </motion.p>

      {/* Illustration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.15 }}
        className="mt-6 w-full max-w-[400px]"
      >
        <img
          src="/converter-upload-illustration.png"
          alt="PDF to data conversion"
          className="w-full h-auto rounded-xl opacity-80"
        />
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: easeOutExpo, delay: 0.2 }}
        className="w-full mt-6"
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={!file ? handleBrowse : undefined}
          className="relative w-full rounded-2xl p-10 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300"
          style={{
            border: isDragOver ? '2px solid #4B82FF' : '2px dashed #162544',
            background: isDragOver ? 'rgba(75,130,255,0.15)' : 'rgba(11,22,40,0.5)',
            transform: isDragOver ? 'scale(1.01)' : 'scale(1)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <input ref={inputRef} type="file" accept=".pdf" className="hidden" onChange={handleFileInput} />

          <AnimatePresence mode="wait">
            {!file ? (
              <motion.div
                key="empty"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.3, ease: easeOutExpo }}
                className="flex flex-col items-center"
              >
                <FileUp
                  size={56}
                  className="transition-colors duration-300"
                  style={{ color: isDragOver ? '#4B82FF' : '#4A6180' }}
                />
                <p className="mt-4 font-display text-xl font-medium text-[#E8EEF7]">
                  {isDragOver ? 'Drop your PDF here' : 'Drop your bank statement PDF'}
                </p>
                <p className="mt-2 text-sm text-[#4A6180]">
                  or <span className="text-[#4B82FF] underline">click to browse</span> files
                </p>
                <p className="mt-3 text-xs text-[#4A6180]">Supports PDF, up to 50MB</p>
              </motion.div>
            ) : (
              <motion.div
                key="file"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                className="flex flex-col items-center"
                onClick={(e) => e.stopPropagation()}
              >
                <FileCheck size={56} className="text-[#00D68F]" />
                <p className="mt-4 font-display text-xl font-medium text-[#E8EEF7]">{file.name}</p>
                <p className="mt-1 text-sm text-[#8BA3C7]">
                  {file.size} · {file.pages} pages detected
                </p>
                <button
                  onClick={removeFile}
                  className="mt-3 flex items-center gap-1 text-xs text-[#4A6180] hover:text-[#FF4D6A] transition-colors duration-200"
                >
                  <X size={14} />
                  Remove
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Convert Now button */}
        <AnimatePresence>
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3, ease: easeOutExpo }}
              className="mt-6"
            >
              <Button
                onClick={handleConvert}
                className="w-full h-12 text-base font-semibold rounded-lg transition-all duration-200 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
              >
                <Sparkles size={18} className="mr-2" />
                Convert Now
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Bank pills */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="mt-8 flex flex-col items-center gap-3"
      >
        <p className="text-xs text-[#4A6180]">Works with every bank format</p>
        <div className="flex flex-wrap justify-center gap-2">
          {BANK_PILLS.map((bank) => (
            <span
              key={bank}
              className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#162544] text-[#8BA3C7] hover:bg-[#1E3260] hover:text-[#E8EEF7] transition-colors duration-200 cursor-default"
            >
              {bank}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase 2: AI Extraction Progress                                    */
/* ------------------------------------------------------------------ */

function ExtractingPhase({ onComplete }: { onComplete: () => void }) {
  const [steps, setSteps] = useState<ExtractionStep[]>(INITIAL_STEPS);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDetails = [
      'Identifying tables and text regions',
      'Chase Bank detected',
      'Found 20 transactions',
      'All fields resolved',
      'Ready!',
    ];

    let currentStep = 0;

    const interval = setInterval(() => {
      if (currentStep >= steps.length) {
        clearInterval(interval);
        setTimeout(onComplete, 800);
        return;
      }

      setSteps((prev) => {
        const next = [...prev];
        // Mark previous step complete
        if (currentStep > 0) {
          next[currentStep - 1] = { ...next[currentStep - 1], status: 'complete', detail: stepDetails[currentStep - 1] };
        }
        // Mark current step processing
        next[currentStep] = { ...next[currentStep], status: 'processing', detail: stepDetails[currentStep] };
        return next;
      });

      setProgress(Math.round(((currentStep + 1) / steps.length) * 100));
      currentStep++;
    }, 1200);

    return () => clearInterval(interval);
  }, [onComplete, steps.length]);

  return (
    <motion.div
      key="extracting"
      {...pageTransition}
      className="w-full max-w-[640px] mx-auto flex flex-col items-center"
      style={{ minHeight: 'calc(70vh - 72px)', justifyContent: 'center' }}
    >
      {/* Status area */}
      <div className="flex flex-col items-center mb-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles size={48} className="text-[#4B82FF]" />
        </motion.div>
        <h2 className="mt-4 font-display text-2xl sm:text-[28px] font-medium text-[#E8EEF7] text-center">
          AI is extracting your transactions...
        </h2>
        <p className="mt-2 text-base text-[#8BA3C7] text-center">
          Analyzing page layout, identifying transactions, validating balances
        </p>
      </div>

      {/* Progress log */}
      <div className="w-full bg-[#162544] border border-[#162544] rounded-xl p-6">
        {steps.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3 border-b border-[rgba(22,37,68,0.5)] last:border-0"
          >
            <div className="w-5 flex-shrink-0 flex items-center justify-center">
              {step.status === 'pending' && <Circle size={18} className="text-[#4A6180]" />}
              {step.status === 'processing' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader2 size={18} className="text-[#4B82FF]" />
                </motion.div>
              )}
              {step.status === 'complete' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                >
                  <CheckCircle2 size={18} className="text-[#00D68F]" />
                </motion.div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-sm font-medium transition-colors duration-200"
                style={{ color: step.status === 'pending' ? '#4A6180' : '#E8EEF7' }}
              >
                {step.label}
              </p>
              <p className="text-xs text-[#4A6180] mt-0.5">{step.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#4A6180]">Processing</span>
          <span className="text-xs font-semibold text-[#E8EEF7]">{progress}%</span>
        </div>
        <div className="w-full h-1 bg-[#162544] rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(135deg, #00D68F 0%, #00B8A9 100%)',
              backgroundSize: '200% 100%',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: easeOutExpo }}
          />
        </div>
        {/* Shimmer overlay */}
        <div className="relative w-full h-1 -mt-1 overflow-hidden rounded-full pointer-events-none">
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)',
              backgroundSize: '200% 100%',
            }}
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase 3: Results Table                                             */
/* ------------------------------------------------------------------ */

function ResultsPhase({ onExport }: { onExport: () => void }) {
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [sort, setSort] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [search, setSearch] = useState('');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const handleSort = (key: keyof Transaction) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const sorted = [...transactions].sort((a, b) => {
    if (!sort.key) return 0;
    const aVal = a[sort.key];
    const bVal = b[sort.key];
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sort.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const filtered = search
    ? sorted.filter((t) =>
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.date.includes(search) ||
        t.type.toLowerCase().includes(search.toLowerCase())
      )
    : sorted;

  const totalDeposits = transactions.filter((t) => t.type === 'Deposit' || t.type === 'Transfer').reduce((s, t) => s + t.amount, 0);
  const totalWithdrawals = transactions.filter((t) => t.type === 'Withdrawal').reduce((s, t) => s + t.amount, 0);
  const closingBalance = OPENING_BALANCE + totalDeposits - totalWithdrawals;
  const reconciled = Math.abs(closingBalance - MOCK_TRANSACTIONS[MOCK_TRANSACTIONS.length - 1].balance) < 0.01;

  const SortIcon = ({ column }: { column: keyof Transaction }) => {
    if (sort.key !== column) return <span className="inline-block w-3" />;
    return sort.direction === 'asc' ? <ChevronUp size={12} className="text-[#4B82FF]" /> : <ChevronDown size={12} className="text-[#4B82FF]" />;
  };

  return (
    <motion.div
      key="review"
      {...pageTransition}
      className="w-full max-w-[1200px] mx-auto pb-24"
    >
      {/* Header bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <h2 className="font-display text-xl sm:text-2xl font-medium text-[#E8EEF7]">
          {transactions.length} Transactions Extracted
        </h2>

        {/* Reconciliation pill */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number], delay: 0.2 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
          style={{
            background: reconciled ? 'rgba(0,214,143,0.12)' : 'rgba(255,176,32,0.12)',
            borderColor: reconciled ? 'rgba(0,214,143,0.2)' : 'rgba(255,176,32,0.2)',
          }}
        >
          {reconciled ? (
            <CheckCircle2 size={14} className="text-[#00D68F]" />
          ) : (
            <AlertTriangle size={14} className="text-[#FFB020]" />
          )}
          <span className="text-xs font-medium" style={{ color: reconciled ? '#00D68F' : '#FFB020' }}>
            {reconciled ? 'Reconciled' : 'Discrepancy detected'}
          </span>
          <span className="text-xs text-[#4A6180]">
            {formatCurrency(OPENING_BALANCE)} → {formatCurrency(closingBalance)}
          </span>
          <span title="Opening Balance + Deposits - Withdrawals = Closing Balance">
            <HelpCircle size={12} className="text-[#4A6180] cursor-help" />
          </span>
        </motion.div>

        <span className="text-xs text-[#4A6180]">4 pages · {transactions.length} txns</span>
      </motion.div>

      {/* Reconciliation banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.1 }}
        className="mb-4 p-4 rounded-xl border flex flex-wrap items-center gap-3 sm:gap-6"
        style={{
          background: 'rgba(0,214,143,0.06)',
          borderColor: 'rgba(0,214,143,0.15)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4A6180]">Opening</span>
          <span className="text-sm font-semibold text-[#E8EEF7]">{formatCurrency(OPENING_BALANCE)}</span>
        </div>
        <span className="text-xs text-[#4A6180]">+</span>
        <div className="flex items-center gap-2">
          <ArrowDownLeft size={14} className="text-[#00D68F]" />
          <span className="text-xs text-[#4A6180]">Deposits</span>
          <span className="text-sm font-semibold text-[#00D68F]">{formatCurrency(totalDeposits)}</span>
        </div>
        <span className="text-xs text-[#4A6180]">-</span>
        <div className="flex items-center gap-2">
          <ArrowUpRight size={14} className="text-[#FF4D6A]" />
          <span className="text-xs text-[#4A6180]">Withdrawals</span>
          <span className="text-sm font-semibold text-[#FF4D6A]">{formatCurrency(totalWithdrawals)}</span>
        </div>
        <span className="text-xs text-[#4A6180]">=</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#4A6180]">Closing</span>
          <span className="text-sm font-semibold text-[#E8EEF7]">{formatCurrency(closingBalance)}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-[#00D68F]" />
          <span className="text-xs font-medium text-[#00D68F]">Balances match</span>
        </div>
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.15 }}
        className="flex flex-wrap items-center gap-3 mb-4"
      >
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A6180]" />
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2.5 rounded-lg text-sm bg-[#0B1628] border border-[#162544] text-[#E8EEF7] placeholder-[#4A6180] focus:border-[#4B82FF] focus:outline-none focus:ring-[3px] focus:ring-[rgba(75,130,255,0.15)] transition-all w-[260px]"
          />
        </div>
        <span className="text-xs text-[#4A6180]">Showing {filtered.length} of {transactions.length}</span>
      </motion.div>

      {/* Transaction Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.2 }}
        className="border border-[#162544] rounded-xl overflow-hidden"
        style={{ background: 'rgba(11,22,40,0.4)' }}
      >
        <div className="overflow-x-auto max-h-[520px] overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#162544] hover:bg-[#162544] border-b-0 sticky top-0 z-10">
                {[
                  { key: 'date' as const, label: 'Date', width: '110px' },
                  { key: 'description' as const, label: 'Description', width: 'auto' },
                  { key: 'type' as const, label: 'Type', width: '100px' },
                  { key: 'amount' as const, label: 'Amount', width: '130px' },
                  { key: 'balance' as const, label: 'Balance', width: '130px' },
                  { key: 'confidence' as const, label: 'Status', width: '90px' },
                ].map((col) => (
                  <TableHead
                    key={col.key}
                    className="text-[#8BA3C7] text-xs font-semibold uppercase tracking-wider cursor-pointer select-none hover:text-[#E8EEF7] transition-colors"
                    style={{ width: col.width, letterSpacing: '0.06em' }}
                    onClick={() => handleSort(col.key)}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      <SortIcon column={col.key} />
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-[#8BA3C7] text-xs font-semibold uppercase tracking-wider" style={{ width: '50px' }} />
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {filtered.map((tx, index) => {
                  const confidenceColor = tx.confidence >= 95 ? '#00D68F' : tx.confidence >= 90 ? '#FFB020' : '#FF4D6A';
                  const confidenceBg = tx.confidence >= 95 ? 'rgba(0,214,143,0.12)' : tx.confidence >= 90 ? 'rgba(255,176,32,0.12)' : 'rgba(255,77,106,0.12)';
                  const amountColor = tx.type === 'Deposit' || tx.type === 'Transfer' ? '#00D68F' : '#FF4D6A';
                  const amountPrefix = tx.type === 'Deposit' || tx.type === 'Transfer' ? '+' : '-';

                  return (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: easeOutExpo, delay: Math.min(index * 0.03, 0.6) }}
                      className="border-b transition-colors duration-150 cursor-pointer"
                      style={{
                        borderColor: 'rgba(22,37,68,0.5)',
                        background: hoveredRow === tx.id ? 'rgba(22,37,68,0.4)' : 'transparent',
                      }}
                      onMouseEnter={() => setHoveredRow(tx.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <TableCell className="text-sm text-[#E8EEF7] font-mono">{formatDate(tx.date)}</TableCell>
                      <TableCell className="text-sm text-[#E8EEF7] max-w-[280px] truncate">{tx.description}</TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border"
                          style={{
                            background:
                              tx.type === 'Deposit'
                                ? 'rgba(0,214,143,0.12)'
                                : tx.type === 'Withdrawal'
                                  ? 'rgba(255,77,106,0.12)'
                                  : 'rgba(75,130,255,0.12)',
                            color:
                              tx.type === 'Deposit' ? '#00D68F' : tx.type === 'Withdrawal' ? '#FF4D6A' : '#4B82FF',
                            borderColor:
                              tx.type === 'Deposit'
                                ? 'rgba(0,214,143,0.2)'
                                : tx.type === 'Withdrawal'
                                  ? 'rgba(255,77,106,0.2)'
                                  : 'rgba(75,130,255,0.2)',
                          }}
                        >
                          {tx.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-right font-mono" style={{ color: amountColor }}>
                        {amountPrefix}{formatCurrency(tx.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-right text-[#8BA3C7] font-mono">
                        {formatCurrency(tx.balance)}
                      </TableCell>
                      <TableCell>
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                          style={{ background: confidenceBg, color: confidenceColor }}
                        >
                          {tx.confidence}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <button className="text-[#4A6180] hover:text-[#E8EEF7] transition-colors p-1">
                          <MoreHorizontal size={16} />
                        </button>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-4 p-4 rounded-xl border border-[#162544] flex flex-wrap items-center justify-between gap-4"
        style={{ background: 'rgba(11,22,40,0.6)' }}
      >
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-[#4A6180]">Total Deposits</p>
            <p className="text-sm font-semibold text-[#00D68F]">{formatCurrency(totalDeposits)}</p>
          </div>
          <div>
            <p className="text-xs text-[#4A6180]">Total Withdrawals</p>
            <p className="text-sm font-semibold text-[#FF4D6A]">{formatCurrency(totalWithdrawals)}</p>
          </div>
          <div>
            <p className="text-xs text-[#4A6180]">Net Change</p>
            <p className="text-sm font-semibold text-[#E8EEF7]">{formatCurrency(totalDeposits - totalWithdrawals)}</p>
          </div>
          <div>
            <p className="text-xs text-[#4A6180]">Avg Confidence</p>
            <p className="text-sm font-semibold text-[#00D68F]">
              {Math.round(transactions.reduce((s, t) => s + t.confidence, 0) / transactions.length)}%
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bottom action bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 z-30 border-t px-6 py-4"
        style={{
          background: 'rgba(5,11,20,0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderColor: '#162544',
        }}
      >
        <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-sm text-[#8BA3C7]">
            <span>{transactions.length} transactions</span>
            <span className="text-[#4A6180]">·</span>
            <span className="text-[#00D68F]">All validations passed</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => window.location.reload()}
              className="text-[#8BA3C7] hover:text-[#E8EEF7] hover:bg-[#162544]"
            >
              <RotateCcw size={16} className="mr-2" />
              Start Over
            </Button>
            <Button
              onClick={onExport}
              className="h-10 px-6 text-sm font-semibold rounded-lg transition-all duration-200 hover:brightness-110 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
            >
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Phase 4: Export Panel                                              */
/* ------------------------------------------------------------------ */

function ExportPhase({ onRestart }: { onRestart: () => void }) {
  const [selectedFormat, setSelectedFormat] = useState<string>('csv');

  const handleDownload = () => {
    const fmt = EXPORT_FORMATS.find((f) => f.key === selectedFormat);
    toast.success(`Downloaded as ${fmt?.label || 'CSV'}`, {
      description: `statementwise_export.${selectedFormat} — ${fmt?.size || ''}`,
    });
  };

  return (
    <motion.div
      key="export"
      {...pageTransition}
      className="w-full max-w-[560px] mx-auto flex flex-col items-center"
      style={{ minHeight: 'calc(70vh - 72px)', justifyContent: 'center' }}
    >
      {/* Success icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
        className="relative"
      >
        <CheckCircle2 size={64} className="text-[#00D68F]" />
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: '0 0 40px rgba(0,214,143,0.3)',
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Title */}
      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.2 }}
        className="mt-6 font-display text-3xl sm:text-[44px] font-medium text-[#E8EEF7] text-center"
        style={{ lineHeight: 1.12 }}
      >
        Export Ready
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.3 }}
        className="mt-2 text-base text-[#8BA3C7] text-center"
      >
        {MOCK_TRANSACTIONS.length} transactions successfully extracted and validated.
      </motion.p>

      {/* Format selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.35 }}
        className="w-full mt-8"
      >
        <p className="text-xs font-semibold text-[#E8EEF7] uppercase tracking-[0.06em] mb-3">
          Choose export format
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {EXPORT_FORMATS.map((fmt, i) => {
            const Icon = fmt.icon;
            const isSelected = selectedFormat === fmt.key;
            return (
              <motion.button
                key={fmt.key}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.4 + i * 0.08 }}
                onClick={() => setSelectedFormat(fmt.key)}
                className="relative flex flex-col items-center p-4 rounded-xl border transition-all duration-200 cursor-pointer"
                style={{
                  borderColor: isSelected ? '#4B82FF' : '#162544',
                  background: isSelected ? 'rgba(75,130,255,0.15)' : 'rgba(11,22,40,0.5)',
                }}
              >
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number] }}
                    className="absolute top-2 right-2"
                  >
                    <Check size={14} className="text-[#4B82FF]" />
                  </motion.div>
                )}
                <Icon size={28} className={isSelected ? 'text-[#4B82FF]' : 'text-[#4A6180]'} />
                <span className={`mt-2 text-sm font-medium ${isSelected ? 'text-[#E8EEF7]' : 'text-[#8BA3C7]'}`}>
                  {fmt.label}
                </span>
                <span className="text-xs text-[#4A6180] mt-0.5">{fmt.desc}</span>
                <span className="text-[10px] text-[#4A6180] mt-1">{fmt.size}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: easeOutExpo, delay: 0.7 }}
        className="w-full mt-8 flex flex-col gap-3"
      >
        <Button
          onClick={handleDownload}
          className="w-full h-12 text-base font-semibold rounded-lg transition-all duration-200 hover:brightness-110 hover:scale-[1.01] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #4B82FF 0%, #1E6BFF 100%)' }}
        >
          <Download size={18} className="mr-2" />
          Download .{selectedFormat}
        </Button>
        <Button
          variant="outline"
          onClick={onRestart}
          className="w-full h-11 text-sm font-medium rounded-lg border-[#162544] bg-transparent text-[#E8EEF7] hover:bg-[#162544] hover:border-[#1E3260]"
        >
          <ArrowLeftRight size={16} className="mr-2" />
          Convert Another
        </Button>
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="mt-4 flex items-center gap-4 text-sm"
      >
        <span className="text-[#4A6180]">Send to:</span>
        <button className="text-[#78A4FF] hover:text-[#B0CCFF] transition-colors duration-200 hover:underline">
          QuickBooks
        </button>
        <span className="text-[#4A6180]">·</span>
        <button className="text-[#78A4FF] hover:text-[#B0CCFF] transition-colors duration-200 hover:underline">
          Xero
        </button>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                     */
/* ------------------------------------------------------------------ */

function StepIndicator({ phase }: { phase: Phase }) {
  const steps: { key: Phase; label: string }[] = [
    { key: 'upload', label: 'Upload' },
    { key: 'extracting', label: 'Extract' },
    { key: 'review', label: 'Review' },
    { key: 'export', label: 'Export' },
  ];

  const phaseIndex = steps.findIndex((s) => s.key === phase);

  return (
    <div className="w-full py-4 border-b border-[#162544] mb-6" style={{ background: 'rgba(5,11,20,0.9)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}>
      <div className="max-w-[1200px] mx-auto px-6 flex items-center justify-center">
        <div className="flex items-center gap-2 sm:gap-3">
          {steps.map((step, i) => {
            const isComplete = i < phaseIndex;
            const isActive = i === phaseIndex;

            return (
              <div key={step.key} className="flex items-center gap-2 sm:gap-3">
                {/* Connector */}
                {i > 0 && (
                  <div
                    className="w-6 sm:w-10 h-[2px] rounded-full transition-colors duration-500"
                    style={{ background: isComplete ? '#00D68F' : '#162544' }}
                  />
                )}
                {/* Step dot + label */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div
                    className="w-3 h-3 rounded-full border-2 flex-shrink-0 transition-all duration-300"
                    style={{
                      borderColor: isComplete ? '#00D68F' : isActive ? '#4B82FF' : '#162544',
                      background: isComplete ? '#00D68F' : isActive ? '#4B82FF' : 'transparent',
                    }}
                  />
                  <span
                    className="hidden sm:inline text-xs font-medium transition-colors duration-300"
                    style={{
                      color: isComplete ? '#8BA3C7' : isActive ? '#E8EEF7' : '#4A6180',
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Convert Page                                                  */
/* ------------------------------------------------------------------ */

export default function Convert() {
  const [phase, setPhase] = useState<Phase>('upload');

  const handleFileSelect = () => setPhase('extracting');
  const handleExtractComplete = () => setPhase('review');
  const handleExport = () => setPhase('export');
  const handleRestart = () => {
    setPhase('upload');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[calc(100dvh-72px)] pt-[72px]" style={{ background: '#050B14' }}>
      {/* Step indicator */}
      <StepIndicator phase={phase} />

      {/* Phase content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {phase === 'upload' && <UploadPhase key="upload" onFileSelect={handleFileSelect} />}
          {phase === 'extracting' && <ExtractingPhase key="extracting" onComplete={handleExtractComplete} />}
          {phase === 'review' && <ResultsPhase key="review" onExport={handleExport} />}
          {phase === 'export' && <ExportPhase key="export" onRestart={handleRestart} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
