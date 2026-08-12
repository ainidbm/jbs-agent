/**
 * API client — all calls go through Cloudflare Worker.
 *
 * Auth flow:
 *   Login page → POST /api/auth/login → JWT → localStorage
 *   All other requests → Authorization: Bearer <JWT>
 *
 * Worker determines store_id from JWT — no need to pass it in query params.
 */

import { getToken } from "./auth";
import { apiUrl, redirectToLogin } from "./config";

async function request<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
  const url = new URL(apiUrl(path), window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined) url.searchParams.set(k, String(v)); });
  }
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url.toString(), { headers });
  if (res.status === 401) {
    // Token expired → force re-login
    redirectToLogin();
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

// ── Types ──

export interface KPIMetrics {
  period: { start: string; end: string };
  metrics: {
    total_income: number; total_expense: number; net_profit: number;
    session_count: number; avg_revenue_per_session: number;
  };
  changes: { income_change_pct: number | null };
}

export interface TrendData {
  historical: Array<{ month: string; income: number; expense: number; net_profit: number }>;
  forecast: any;
}

export interface TopScript {
  name: string; session_count: number; total_revenue: number;
  avg_revenue: number; avg_players: number;
}

export interface FinancialRecord {
  id: string; record_type: string; category: string;
  amount: number; record_date: string; description: string | null; recorded_by: string | null;
}

export interface FinancialRecordsPage {
  total: number; page: number; page_size: number; records: FinancialRecord[];
}

export interface CategorySummary {
  category: string; total: number; count: number;
}

export interface LeaderboardScript {
  rank: number; script_name: string; total_sessions: number;
  total_revenue: number; recent_sessions: number; hot_score: number;
}

export interface LeaderboardResult {
  scope: string; scope_type: string; store_count: number;
  period_days: number; scripts: LeaderboardScript[];
}

// ── API methods ──

export const api = {
  getKPI: (period = "current_month") =>
    request<KPIMetrics>("/api/dashboard/kpi", { period }),

  getTrend: (months = 12) =>
    request<TrendData>("/api/dashboard/trend", { months: String(months) }),

  getTopScripts: (period = "rolling_90d", top_n = 5) =>
    request<{ period_days: number; scripts: TopScript[] }>("/api/dashboard/top-scripts", { period, top_n: String(top_n) }),

  getFinancialRecords: (p?: Record<string, string | number>) =>
    request<FinancialRecordsPage>("/api/financials/records", p),

  getCategorySummary: (record_type = "income", period = "current_month") =>
    request<{ period: any; record_type: string; grand_total: number; categories: CategorySummary[] }>(
      "/api/financials/summary-by-category", { record_type, period }
    ),

  getLeaderboard: (p?: Record<string, string | number | undefined>) =>
    request<LeaderboardResult>("/api/leaderboard/popular-scripts", p),
};
