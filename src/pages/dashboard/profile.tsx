import { Helmet } from '@dr.pogodin/react-helmet';
import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData } from '@/lib/useDashboard';
import { ProtectedRoute, useSession } from '@/lib/auth/auth-client';
import { dashboard_modules } from 'virtual:content';

function ProfileContent() {
  const { data, loading, refresh } = useDashboardData();
  const { user: sessionUser } = useSession();
  const [form, setForm] = useState({ mobile: '', address: '', city: '', state: '', gstNumber: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (data?.profile) {
      setForm({
        mobile: data.profile.mobile || '',
        address: data.profile.address || '',
        city: data.profile.city || '',
        state: data.profile.state || '',
        gstNumber: data.profile.gstNumber || '',
      });
    }
  }, [data?.profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch('/api/dashboard/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setSaved(true);
      void refresh();
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))' }} />
    </div>
  );

  const profile = data?.profile;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Account info (read-only) */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
            style={{ background: 'hsl(var(--primary))', color: 'white' }}>
            {sessionUser?.name?.charAt(0)?.toUpperCase() || 'F'}
          </div>
          <div>
            <div className="font-bold text-gray-800">{sessionUser?.name}</div>
            <div className="text-sm text-gray-500">{sessionUser?.email}</div>
            {profile?.franchiseCode && <div className="text-xs text-gray-400 mt-0.5">Code: {profile.franchiseCode}</div>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Franchise Type', profile?.franchiseType || '—'],
            ['Application ID', profile?.applicationId || '—'],
            ['PAN Number', profile?.panNumber || '—'],
            ['Status', profile?.status || 'Active'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl p-3" style={{ background: 'hsl(var(--muted))' }}>
              <div className="text-xs text-gray-500 mb-0.5">{label}</div>
              <div className="font-semibold text-gray-700 capitalize">{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Editable fields */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-bold text-sm mb-5" style={{ color: 'hsl(var(--primary))' }}>{dashboard_modules.profile.title}</h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Mobile Number', key: 'mobile', type: 'tel' },
              { label: 'GST Number', key: 'gstNumber', type: 'text' },
              { label: 'City', key: 'city', type: 'text' },
              { label: 'State', key: 'state', type: 'text' },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{f.label}</label>
                <input type={f.type} value={form[f.key as keyof typeof form]}
                  onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: 'hsl(var(--border))' }} />
              </div>
            ))}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Address</label>
              <textarea value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} rows={2}
                className="w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 resize-none transition-all"
                style={{ borderColor: 'hsl(var(--border))' }} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="submit" disabled={saving}
              className="px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-70 hover:shadow-md"
              style={{ background: 'hsl(var(--primary))' }}>
              {saving ? 'Saving...' : dashboard_modules.profile.saveBtn}
            </button>
            {saved && (
              <motion.div initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 text-sm text-green-700">
                <CheckCircle className="w-4 h-4" />
                {dashboard_modules.profile.savedMsg}
              </motion.div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>My Profile - RCF Portal</title><meta name="description" content="View and update your franchise profile details." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="My Profile" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">My Profile – RCF Franchise Portal</h1>
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
