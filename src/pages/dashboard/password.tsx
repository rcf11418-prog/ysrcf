import { Helmet } from '@dr.pogodin/react-helmet';
import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { changePassword } from '@/lib/auth/auth-client';
import { dashboard_modules } from 'virtual:content';

function PasswordContent() {
  const [form, setForm] = useState({ current: '', newPass: '', confirm: '' });
  const [show, setShow] = useState({ current: false, newPass: false, confirm: false });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.newPass !== form.confirm) { setError('New passwords do not match.'); return; }
    if (form.newPass.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      const result = await changePassword({ currentPassword: form.current, newPassword: form.newPass, revokeOtherSessions: true });
      if (result?.error) throw new Error(result.error.message || 'Failed to change password');
      setSuccess(true);
      setForm({ current: '', newPass: '', confirm: '' });
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-sm mb-5" style={{ color: 'hsl(var(--primary))' }}>{dashboard_modules.password.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{dashboard_modules.password.currentLabel}</label>
            <div className="relative">
              <input type={show.current ? 'text' : 'password'} value={form.current}
                onChange={(e) => setForm((p) => ({ ...p, current: e.target.value }))}
                placeholder="Enter current password"
                className="w-full px-4 py-3 pr-11 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'hsl(var(--border))' }} />
              <button type="button" onClick={() => setShow((p) => ({ ...p, current: !p.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{dashboard_modules.password.newLabel}</label>
            <div className="relative">
              <input type={show.newPass ? 'text' : 'password'} value={form.newPass}
                onChange={(e) => setForm((p) => ({ ...p, newPass: e.target.value }))}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 pr-11 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'hsl(var(--border))' }} />
              <button type="button" onClick={() => setShow((p) => ({ ...p, newPass: !p.newPass }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show.newPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">{dashboard_modules.password.confirmLabel}</label>
            <div className="relative">
              <input type={show.confirm ? 'text' : 'password'} value={form.confirm}
                onChange={(e) => setForm((p) => ({ ...p, confirm: e.target.value }))}
                placeholder="Repeat new password"
                className="w-full px-4 py-3 pr-11 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ borderColor: 'hsl(var(--border))' }} />
              <button type="button" onClick={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl text-sm text-red-700 bg-red-50">
              <AlertCircle className="w-4 h-4 shrink-0" />{error}
            </div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 p-3 rounded-xl text-sm text-green-700 bg-green-50">
              <CheckCircle className="w-4 h-4 shrink-0" />Password updated successfully.
            </motion.div>
          )}

          <button type="submit" disabled={saving}
            className="w-full py-3 rounded-xl text-sm font-bold text-white transition-all hover:shadow-md disabled:opacity-70"
            style={{ background: 'hsl(var(--primary))' }}>
            {saving ? 'Updating...' : dashboard_modules.password.submitBtn}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function PasswordPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Change Password - RCF Portal</title><meta name="description" content="Update your franchise portal account password." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="Change Password" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Change Password – RCF Franchise Portal</h1>
        <PasswordContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
