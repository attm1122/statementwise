/**
 * Hooks index — Central export for all custom hooks
 */

export { useAuthGuard } from './useAuthGuard';

export { useDataRetention } from './useDataRetention';
export type { DataRetentionState, DataRetentionActions, RetentionPeriod } from './useDataRetention';

export { usePrivacyAnalytics } from './usePrivacyAnalytics';
export type { AnalyticsEvent, AnalyticsState, AnalyticsActions } from './usePrivacyAnalytics';

export { useSecureStorage } from './useSecureStorage';
