import { useState, useEffect, useCallback } from 'react';

export interface FranchiseeProfile {
  id: number;
  userId: string;
  applicationId?: string;
  franchiseCode?: string;
  franchiseType?: string;
  mobile?: string;
  address?: string;
  city?: string;
  state?: string;
  panNumber?: string;
  gstNumber?: string;
  totalInvestment?: string;
  paidAmount?: string;
  pendingAmount?: string;
  progressStage?: number;
  progressPercent?: number;
  status?: string;
}

export interface DashboardData {
  user: { id: string; name: string; email: string };
  profile: FranchiseeProfile | null;
  stats: { unreadNotifications: number; openTickets: number };
}

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard/me', { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to load');
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  return { data, loading, error, refresh };
}

export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, { credentials: 'include', ...options });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error((err as { error?: string }).error || 'Request failed');
  }
  return res.json() as Promise<T>;
}
