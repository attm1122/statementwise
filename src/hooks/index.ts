/**
 * Hooks index — Central export for all custom hooks
 */

export { useDataRetention } from './useDataRetention';
export type { DataRetentionState, DataRetentionActions, RetentionPeriod } from './useDataRetention';

export { usePrivacyAnalytics } from './usePrivacyAnalytics';
export type { AnalyticsEvent, AnalyticsState, AnalyticsActions } from './usePrivacyAnalytics';
