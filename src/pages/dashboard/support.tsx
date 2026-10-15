import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData, apiFetch } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { dashboard_modules } from 'virtual:content';

interface Ticket {
  id: number; ticketNumber: string; subject: string; category?: string;
  priority: string; status: string; createdAt: string; updatedAt: string;
}

const statusClass = (s: string) => {
  if (s === 'open') return 'bg-blue-50 text-blue-700';
  if (s === 'in_progress') return 'bg-amber-50 text-amber-700';
  if (s === 'resolved') return 'bg-green-50 text-green-700';
  return 'bg-gray-100 text-gray-500';
};
const priorityClass = (p: string) => {
  if (p === 'urgent') return 'bg-red-50 text-red-700';
  if (p === 'high') return 'bg-orange-50 text-orange-700';
  if (p === 'medium') return 'bg-amber-50 text-amber-700';
  return 'bg-gray-100 text-gray-500';
};

function SupportContent() {
  const { data } = useDashboardData();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', category: 'General', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    apiFetch<Ticket[]>('/api/dashboard/support')
      .then(setTickets).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [data]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    try {
      await apiFetch('/api/dashboard/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setShowForm(false);
      setForm({ subject: '', description: '', category: 'General', priority: 'medium' });
      load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to submit ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <h2 className="font-bold" style={{ color: 'hsl(var(--primary))' }}>{dashboard_modules.support.title}</h2>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:shadow-md"
          style={{ background: 'hsl(var(--primary))' }}>
          <Plus className="w-4 h-4" />
          {dashboard_modules.support.newTicketBtn}
        </button>
      </div>

      {/* New ticket form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>New Support Ticket</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{dashboard_modules.support.form.subjectLabel} *</label>
                <input value={form.subject} onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))} required
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: 'hsl(var(--border))' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{dashboard_modules.support.form.categoryLabel}</label>
                  <select value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                    style={{ borderColor: 'hsl(var(--border))' }}>
                    {['Technical', 'Payment', 'Delivery', 'General'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">{dashboard_modules.support.form.priorityLabel}</label>
                  <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2"
                    style={{ borderColor: 'hsl(var(--border))' }}>
                    {['low', 'medium', 'high', 'urgent'].map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{dashboard_modules.support.form.descriptionLabel} *</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} required rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none transition-all"
                  style={{ borderColor: 'hsl(var(--border))' }} />
              </div>
              {formError && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0" />{formError}
                </div>
              )}
              <div className="flex gap-3">
                <button type="submit" disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70"
                  style={{ background: 'hsl(var(--primary))' }}>
                  {submitting ? 'Submitting...' : dashboard_modules.support.form.submitBtn}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--primary))' }}>
                  {dashboard_modules.support.form.cancelBtn}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tickets list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))' }} />
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{dashboard_modules.support.emptyText}</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
            {tickets.map((t, i) => (
              <motion.div key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-gray-400">{t.ticketNumber}</span>
                      <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + statusClass(t.status)}>{t.status.replace('_', ' ')}</span>
                      <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + priorityClass(t.priority)}>{t.priority}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-800">{t.subject}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{t.category} · {new Date(t.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function SupportPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Support - RCF Portal</title><meta name="description" content="Raise and track support tickets for your franchise." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="Support" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Support – RCF Franchise Portal</h1>
        <SupportContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
