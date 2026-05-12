/**
 * Statementwise API Client
 * Type-safe HTTP client for the Statementwise FastAPI backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://api.statementwiseai.com/v1";

// ── Types ─────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: PaginationMeta;
  error?: ApiError;
}

export interface PaginationMeta {
  page: number;
  per_page: number;
  total: number;
  pages?: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  request_id?: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  company_name?: string;
  role: string;
  status: string;
  email_verified: boolean;
  avatar_url?: string;
  timezone: string;
  locale: string;
  created_at: string;
  last_login_at?: string;
}

export interface TokenData {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface Conversion {
  id: string;
  user_id: string;
  portal_id?: string;
  filename: string;
  file_size_bytes: number;
  page_count?: number;
  status: ConversionStatus;
  model_used?: string;
  credits_consumed: number;
  statement_metadata?: StatementMetadata;
  opening_balance?: Balance;
  closing_balance?: Balance;
  summary?: StatementSummary;
  reconciliation?: Reconciliation;
  error_message?: string;
  error_code?: string;
  created_at: string;
  started_at?: string;
  completed_at?: string;
  transactions?: Transaction[];
}

export type ConversionStatus =
  | "pending"
  | "processing"
  | "extracting"
  | "validating"
  | "completed"
  | "failed"
  | "cancelled";

export interface StatementMetadata {
  bank_name: string;
  account_holder?: string;
  account_number?: string;
  account_type?: string;
  statement_period?: { start_date: string; end_date: string };
  statement_date?: string;
  currency: string;
}

export interface Balance {
  amount: number;
  date: string;
  currency?: string;
}

export interface Transaction {
  id: string;
  conversion_id: string;
  transaction_date: string;
  description: string;
  reference?: string;
  category?: string;
  debit?: number;
  credit?: number;
  amount: number;
  currency: string;
  running_balance?: number;
  confidence_score?: number;
  raw_text?: string;
  metadata?: Record<string, unknown>;
}

export interface StatementSummary {
  total_credits: number;
  total_debits: number;
  transaction_count: number;
}

export interface Reconciliation {
  calculated_closing: number;
  matches_statement: boolean;
  variance: number;
  validation_report?: ValidationReport;
}

export interface ValidationReport {
  issues: string[];
  warnings: string[];
  transaction_count: number;
  is_valid: boolean;
  overall_confidence: number;
}

export interface Portal {
  id: string;
  name: string;
  slug: string;
  description?: string;
  owner_id: string;
  status: string;
  branding_color: string;
  logo_url?: string;
  custom_domain?: string;
  settings?: Record<string, unknown>;
  members?: PortalMember[];
  created_at: string;
  updated_at: string;
}

export interface PortalMember {
  id: string;
  portal_id: string;
  user_id: string;
  role: string;
  user?: User;
  created_at: string;
}

export interface CreditInfo {
  balance: number;
  lifetime_earned: number;
  lifetime_used: number;
  subscription_plan?: string;
  monthly_quota?: number;
}

export interface DashboardStats {
  overview: {
    total_conversions: number;
    completed_conversions: number;
    failed_conversions: number;
    success_rate: number;
    total_pages_processed: number;
    total_transactions_extracted: number;
  };
  credits: CreditInfo;
  monthly_activity: Array<{ month: string; conversions: number }>;
  recent_conversions: Conversion[];
}

export interface ExportResult {
  conversion_id: string;
  format: string;
  filename: string;
  content_type: string;
  download_url: string;
  expires_at: string;
}

// ── HTTP Client ───────────────────────────────────────────────────

class ApiClient {
  private baseUrl: string;
  private getToken: () => string | null;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.getToken = getToken;
  }

  private async getHeaders(includeAuth: boolean = true): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Accept": "application/json",
    };

    if (includeAuth) {
      const token = this.getToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json();

    if (!response.ok) {
      const error: ApiError = {
        code: data.error?.code || `HTTP_${response.status}`,
        message: data.error?.message || response.statusText,
        details: data.error?.details,
        request_id: response.headers.get("X-Request-ID"),
      };

      // Handle auth errors
      if (response.status === 401) {
        // Token expired - trigger refresh
        localStorage.removeItem("access_token");
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }

      throw new ApiErrorException(error);
    }

    return data as ApiResponse<T>;
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries: number = 3
  ): Promise<Response> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, options);

        // Retry on 5xx or network errors
        if (response.status >= 500 && attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error as Error;
        if (attempt < retries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw lastError || new Error("Request failed after retries");
  }

  // ── Auth ────────────────────────────────────────────────────────

  async register(data: {
    email: string;
    password: string;
    full_name: string;
    company_name?: string;
  }): Promise<ApiResponse<TokenData>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/auth/register`, {
      method: "POST",
      headers: await this.getHeaders(false),
      body: JSON.stringify(data),
    });
    return this.handleResponse<TokenData>(response);
  }

  async login(email: string, password: string): Promise<ApiResponse<TokenData>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/auth/login`, {
      method: "POST",
      headers: await this.getHeaders(false),
      body: JSON.stringify({ email, password }),
    });
    return this.handleResponse<TokenData>(response);
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/auth/refresh`, {
      method: "POST",
      headers: await this.getHeaders(false),
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return this.handleResponse(response);
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/auth/profile`, {
      headers: await this.getHeaders(),
    });
    return this.handleResponse<User>(response);
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/auth/profile`, {
      method: "PATCH",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<User>(response);
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/auth/change-password`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    return this.handleResponse<void>(response);
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/auth/logout`, {
      method: "POST",
      headers: await this.getHeaders(),
    });
    return this.handleResponse<void>(response);
  }

  // ── Conversion ──────────────────────────────────────────────────

  async uploadStatement(
    file: File,
    portalId?: string,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<Conversion>> {
    const formData = new FormData();
    formData.append("file", file);
    if (portalId) formData.append("portal_id", portalId);

    const response = await fetch(`${this.baseUrl}/convert/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.getToken() || ""}`,
      },
      body: formData,
    });
    return this.handleResponse<Conversion>(response);
  }

  async getConversionStatus(conversionId: string): Promise<ApiResponse<Conversion>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/convert/status/${conversionId}`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse<Conversion>(response);
  }

  async getConversionResults(conversionId: string): Promise<ApiResponse<Conversion>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/convert/results/${conversionId}`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse<Conversion>(response);
  }

  async listConversions(
    page: number = 1,
    perPage: number = 20,
    status?: ConversionStatus
  ): Promise<ApiResponse<Conversion[]>> {
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
    if (status) params.append("status", status);

    const response = await this.fetchWithRetry(
      `${this.baseUrl}/convert/list?${params}`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse<Conversion[]>(response);
  }

  async exportConversion(conversionId: string, format: string): Promise<ApiResponse<ExportResult>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/convert/export/${conversionId}`,
      {
        method: "POST",
        headers: await this.getHeaders(),
        body: JSON.stringify({ format }),
      }
    );
    return this.handleResponse<ExportResult>(response);
  }

  async deleteConversion(conversionId: string): Promise<ApiResponse<void>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/convert/${conversionId}`,
      { method: "DELETE", headers: await this.getHeaders() }
    );
    return this.handleResponse<void>(response);
  }

  // ── Dashboard ───────────────────────────────────────────────────

  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/dashboard/stats`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse<DashboardStats>(response);
  }

  async getActivityFeed(page: number = 1, perPage: number = 20, days: number = 30): Promise<ApiResponse<Conversion[]>> {
    const params = new URLSearchParams({
      page: String(page),
      per_page: String(perPage),
      days: String(days),
    });
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/dashboard/activity?${params}`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse<Conversion[]>(response);
  }

  async getUsageBreakdown(days: number = 30): Promise<ApiResponse<Record<string, unknown>>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/dashboard/usage?days=${days}`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  // ── Portals ─────────────────────────────────────────────────────

  async createPortal(data: Partial<Portal>): Promise<ApiResponse<Portal>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/portals/`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify(data),
    });
    return this.handleResponse<Portal>(response);
  }

  async listPortals(): Promise<ApiResponse<Portal[]>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/portals/`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse<Portal[]>(response);
  }

  async getPortal(portalId: string): Promise<ApiResponse<Portal>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/portals/${portalId}`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse<Portal>(response);
  }

  // ── Credits ─────────────────────────────────────────────────────

  async getCredits(): Promise<ApiResponse<CreditInfo & { recent_transactions: Array<Record<string, unknown>> }>> {
    const response = await this.fetchWithRetry(
      `${this.baseUrl}/billing/credits`,
      { headers: await this.getHeaders() }
    );
    return this.handleResponse(response);
  }

  async purchaseCredits(amount: number): Promise<ApiResponse<{ credits_added: number; new_balance: number }>> {
    const response = await this.fetchWithRetry(`${this.baseUrl}/billing/purchase`, {
      method: "POST",
      headers: await this.getHeaders(),
      body: JSON.stringify({ amount }),
    });
    return this.handleResponse(response);
  }
}

// ── Error Class ───────────────────────────────────────────────────

export class ApiErrorException extends Error {
  public error: ApiError;

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiErrorException";
    this.error = error;
  }
}

// ── Singleton Instance ────────────────────────────────────────────

const getToken = (): string | null => {
  return localStorage.getItem("access_token");
};

export const api = new ApiClient(API_BASE_URL, getToken);

export default api;
