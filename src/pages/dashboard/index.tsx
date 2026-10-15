import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import {
  TrendingUp, CreditCard, FileText, Bell, HeadphonesIcon,
  FolderOpen, Package, Truck, ChevronRight, AlertCircle
} from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { dashboard } from 'virtual:content';
import { ContentListContext } from '@airo/content';

const QUICK_ICONS = [TrendingUp, CreditCard, FileText, Package, Truck, FolderOpen, Bell, HeadphonesIcon];
const QUICK_COLORS = [
  'hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))',
  '#7C3AED', '#0891B2', '#D97706', '#DC2626', '#059669',
];
const STAT_COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#DC2626'];

function OverviewContent() {
  const { data, loading, error } = useDashboardData();

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))' }} />
    </div>
  );

  if (error) return (
    <div className="flex items-center gap-2 p-4 rounded-xl bg-red-50 text-red-700 text-sm">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>Failed to load dashboard data. Please refresh.</span>
    </div>
  );

  const profile = data?.profile;
  const progressStage = profile?.progressStage ?? 0;
  const progressPercent = profile?.progressPercent ?? Math.round((progressStage / (dashboard.progressStages.length - 1)) * 100);
  const currentStageName = dashboard.progressStages[progressStage]?.label ?? dashboard.progressStages[0].label;

  const statValues = [
    profile?.totalInvestment ? `₹${Number(profile.totalInvestment).toLocaleString('en-IN')}` : '—',
    profile?.paidAmount ? `₹${Number(profile.paidAmount).toLocaleString('en-IN')}` : '—',
    profile?.pendingAmount ? `₹${Number(profile.pendingAmount).toLocaleString('en-IN')}` : '—',
    String(data?.stats?.openTickets ?? 0),
  ];

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(221 80% 20%) 100%)' }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 50%, hsl(var(--accent)) 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <p className="text-white/60 text-sm mb-1">{dashboard.overview.welcomeLabel}</p>
          <h2 className="text-xl font-bold mb-1">{data?.user?.name || 'Franchisee'}</h2>
          {profile ? (
            <div className="flex flex-wrap gap-3 mt-3">
              {profile.franchiseCode && (
                <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  Code: {profile.franchiseCode}
                </span>
              )}
              {profile.franchiseType && (
                <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  {profile.franchiseType}
                </span>
              )}
              <span className="text-xs px-3 py-1 rounded-full font-semibold capitalize" style={{ background: 'rgba(255,255,255,0.15)' }}>
                {profile.status || 'Active'}
              </span>
            </div>
          ) : (
            <p className="text-white/50 text-xs mt-2">{dashboard.overview.noProfileNote}</p>
          )}
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <ContentListContext field="dashboard.stats">
          {dashboard.stats.map((stat, i) => (
            <motion.div key={stat.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}
              className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="text-xs text-gray-500 mb-1">{stat.label}</div>
              <div className="text-xl font-bold mb-0.5" style={{ color: STAT_COLORS[i] }}>{statValues[i]}</div>
              <div className="text-xs text-gray-400">{stat.sub}</div>
            </motion.div>
          ))}
        </ContentListContext>
      </div>

      {/* Progress bar */}
      {profile && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>{dashboard.overview.progressTitle}</h3>
            <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: 'hsl(var(--secondary)/0.1)', color: 'hsl(var(--secondary))' }}>
              {progressPercent}% Complete
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full mb-3" style={{ background: 'hsl(var(--muted))' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPercent}%`, background: 'hsl(var(--secondary))' }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              Current: <span className="font-semibold text-gray-700">{currentStageName}</span>
            </span>
            <Link to="/dashboard/progress" className="text-xs font-semibold flex items-center gap-1 hover:underline" style={{ color: 'hsl(var(--primary))' }}>
              View Details <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Quick links grid */}
      <div>
        <h3 className="font-bold text-sm text-gray-600 mb-3">{dashboard.overview.quickAccessTitle}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ContentListContext field="dashboard.quickLinks">
            {dashboard.quickLinks.map((item, i) => {
              const Icon = QUICK_ICONS[i] || TrendingUp;
              const href = item.to;
              return (
                <motion.div key={item.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.25, delay: i * 0.04 }}>
                  <a href={href}
                    className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 text-center">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: QUICK_COLORS[i] + '20' }}>
                      <Icon className="w-5 h-5" style={{ color: QUICK_COLORS[i] }} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">{item.label}</span>
                  </a>
                </motion.div>
              );
            })}
          </ContentListContext>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet>
        <title>Dashboard – RCF Franchise Portal</title>
        <meta name="description" content="RCF Franchise Portal – manage your franchise progress, payments, documents and support." />
        <meta name="robots" content="noindex" />
      </Helmet>
      <DashboardLayout title="Dashboard" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Dashboard – RCF Franchise Portal</h1>
        <OverviewContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
