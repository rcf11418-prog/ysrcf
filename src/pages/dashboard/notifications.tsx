import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData, apiFetch } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { dashboard_modules } from 'virtual:content';

interface Notification {
  id: number; title: string; message: string; type: string;
  isRead: boolean; link?: string; createdAt: string;
}

function TypeIcon({ type }: { type: string }) {
  if (type === 'success') return <CheckCircle className="w-4 h-4 text-green-600" />;
  if (type === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
  if (type === 'alert') return <AlertCircle className="w-4 h-4 text-red-500" />;
  return <Info className="w-4 h-4 text-blue-500" />;
}

function NotificationsContent() {
  const { data, refresh } = useDashboardData();
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    apiFetch<Notification[]>('/api/dashboard/notifications')
      .then(setNotifs).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [data]);

  const markAllRead = async () => {
    await fetch('/api/dashboard/notifications/read', { method: 'PATCH', credentials: 'include' });
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    void refresh();
  };

  const unread = notifs.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'hsl(var(--border))' }}>
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>{dashboard_modules.notifications.title}</h3>
            {unread > 0 && (
              <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: 'hsl(var(--accent))', color: 'hsl(var(--primary))' }}>
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs font-semibold hover:underline" style={{ color: 'hsl(var(--primary))' }}>
              {dashboard_modules.notifications.markAllRead}
            </button>
          )}
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))' }} />
          </div>
        ) : notifs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            {dashboard_modules.notifications.emptyText}
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
            {notifs.map((n, i) => (
              <motion.div key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className={'flex items-start gap-4 px-5 py-4 ' + (n.isRead ? '' : 'bg-blue-50/40')}>
                <div className="mt-0.5 shrink-0"><TypeIcon type={n.type} /></div>
                <div className="flex-1 min-w-0">
                  <div className={'text-sm font-semibold ' + (n.isRead ? 'text-gray-700' : 'text-gray-900')}>{n.title}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString('en-IN')}</div>
                </div>
                {!n.isRead && <div className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: 'hsl(var(--primary))' }} />}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Notifications - RCF Portal</title><meta name="description" content="View your franchise portal notifications and alerts." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="Notifications" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Notifications – RCF Franchise Portal</h1>
        <NotificationsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
