/**
 * Authentication hooks for React/TypeScript frontend
 */

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { api, User, TokenData, ApiErrorException } from "../services/api";

// ── Context ───────────────────────────────────────────────────────

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; company_name?: string }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ── Hook ──────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

// ── Provider ──────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      refreshUser().finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  // Listen for auth expiration events
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    };
    window.addEventListener("auth:expired", handleExpired);
    return () => window.removeEventListener("auth:expired", handleExpired);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await api.login(email, password);
    if (response.success) {
      const { access_token, refresh_token, user } = response.data;
      localStorage.setItem("access_token", access_token);
      localStorage.setItem("refresh_token", refresh_token);
      setUser(user);
    }
  }, []);

  const register = useCallback(
    async (data: { email: string; password: string; full_name: string; company_name?: string }) => {
      const response = await api.register(data);
      if (response.success) {
        const { access_token, refresh_token, user } = response.data;
        localStorage.setItem("access_token", access_token);
        localStorage.setItem("refresh_token", refresh_token);
        setUser(user);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch {
      // Ignore errors
    } finally {
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.getProfile();
      if (response.success) {
        setUser(response.data);
      }
    } catch {
      // Token invalid, clear auth
      setUser(null);
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ── Conversion Hook ───────────────────────────────────────────────

import { useState } from "react";
import { Conversion, ConversionStatus, ExportResult } from "../services/api";

interface UseConversionReturn {
  conversions: Conversion[];
  currentConversion: Conversion | null;
  isLoading: boolean;
  isUploading: boolean;
  error: string | null;
  uploadStatement: (file: File, portalId?: string) => Promise<Conversion | null>;
  pollConversionStatus: (conversionId: string, interval?: number) => Promise<Conversion>;
  exportConversion: (conversionId: string, format: string) => Promise<ExportResult | null>;
  listConversions: (page?: number, perPage?: number) => Promise<void>;
  clearError: () => void;
}

export function useConversion(): UseConversionReturn {
  const [conversions, setConversions] = useState<Conversion[]>([]);
  const [currentConversion, setCurrentConversion] = useState<Conversion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const uploadStatement = useCallback(async (file: File, portalId?: string) => {
    setIsUploading(true);
    setError(null);
    try {
      const response = await api.uploadStatement(file, portalId);
      if (response.success) {
        setCurrentConversion(response.data);
        return response.data;
      }
      return null;
    } catch (err) {
      const message = err instanceof ApiErrorException ? err.error.message : "Upload failed";
      setError(message);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const pollConversionStatus = useCallback(
    async (conversionId: string, interval: number = 2000): Promise<Conversion> => {
      return new Promise((resolve, reject) => {
        const poll = async () => {
          try {
            const response = await api.getConversionStatus(conversionId);
            if (response.success) {
              const conversion = response.data;
              setCurrentConversion(conversion);

              if (conversion.status === "completed" || conversion.status === "failed") {
                if (conversion.status === "completed") {
                  resolve(conversion);
                } else {
                  reject(new Error(conversion.error_message || "Conversion failed"));
                }
                return;
              }
            }
            setTimeout(poll, interval);
          } catch (err) {
            reject(err);
          }
        };
        poll();
      });
    },
    []
  );

  const exportConversion = useCallback(async (conversionId: string, format: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.exportConversion(conversionId, format);
      if (response.success) {
        return response.data;
      }
      return null;
    } catch (err) {
      const message = err instanceof ApiErrorException ? err.error.message : "Export failed";
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const listConversions = useCallback(async (page: number = 1, perPage: number = 20) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.listConversions(page, perPage);
      if (response.success) {
        setConversions(response.data);
      }
    } catch (err) {
      const message = err instanceof ApiErrorException ? err.error.message : "Failed to load conversions";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    conversions,
    currentConversion,
    isLoading,
    isUploading,
    error,
    uploadStatement,
    pollConversionStatus,
    exportConversion,
    listConversions,
    clearError,
  };
}

// ── Dashboard Hook ────────────────────────────────────────────────

import { useState, useEffect } from "react";
import { DashboardStats } from "../services/api";

interface UseDashboardReturn {
  stats: DashboardStats | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      const message =
        err instanceof ApiErrorException ? err.error.message : "Failed to load dashboard";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { stats, isLoading, error, refresh };
}
