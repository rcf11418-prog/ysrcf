import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, Circle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData, apiFetch } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { dashboard } from 'virtual:content';

const STAGES = dashboard.progressStages.map((s) => s.label);

interface ProgressRow { id: number; stage: number; stageName: string; status: string; remarks?: string; completedAt?: string; }

function ProgressContent() {
  const { data, loading } = useDashboardData();
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!data?.profile) return;
    setError('');
    apiFetch<ProgressRow[]>('/api/dashboard/progress')
      .then(setRows)
      .catch((e: Error) => setError(e.message || 'Failed to load progress details.'));
  }, [data?.profile]);

  const currentStage = data?.profile?.progressStage ?? 0;
  const progressPercent = data?.profile?.progressPercent ?? Math.round((currentStage / (STAGES.length - 1)) * 100);

  if (loading) return (
    <div className='flex items-center justify-center h-64'>
      <div className='w-8 h-8 rounded-full border-2 border-t-transparent animate-spin' style={{ borderColor: 'hsl(var(--primary))' }} />
    </div>
  );

  return (
    <div className='space-y-6 max-w-2xl'>
      <div className='bg-white rounded-2xl p-6 shadow-sm'>
        <div className='flex items-center justify-between mb-4'>
          <h2 className='font-bold' style={{ color: 'hsl(var(--primary))' }}>Overall Progress</h2>
          <span className='text-sm font-bold px-3 py-1 rounded-full' style={{ background: 'hsl(var(--secondary)/0.1)', color: 'hsl(var(--secondary))' }}>
            {progressPercent}%
          </span>
        </div>
        <div className='w-full h-3 rounded-full mb-2' style={{ background: 'hsl(var(--muted))' }}>
          <motion.div className='h-full rounded-full' initial={{ width: 0 }} animate={{ width: progressPercent + '%' }} transition={{ duration: 1, ease: 'easeOut' as const }}
            style={{ background: 'hsl(var(--secondary))' }} />
        </div>
        <p className='text-xs text-gray-500'>Stage {currentStage + 1} of {STAGES.length}: <span className='font-semibold'>{STAGES[currentStage]}</span></p>
      </div>
      {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b' style={{ borderColor: 'hsl(var(--border))' }}>
          <h3 className='font-bold text-sm' style={{ color: 'hsl(var(--primary))' }}>Stage-by-Stage Progress</h3>
        </div>
        <div className='divide-y' style={{ borderColor: 'hsl(var(--border))' }}>
          {STAGES.map((stageName, i) => {
            const row = rows.find((r) => r.stage === i);
            const status = row?.status ?? (i < currentStage ? 'completed' : i === currentStage ? 'in_progress' : 'pending');
            const done = status === 'completed';
            const active = status === 'in_progress';
            const rejected = status === 'rejected';
            return (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.04 }}
                className='flex items-start gap-4 px-5 py-4'>
                <div className='mt-0.5 shrink-0'>
                  {done ? <CheckCircle className='w-5 h-5' style={{ color: 'hsl(var(--secondary))' }} />
                    : rejected ? <XCircle className='w-5 h-5 text-red-600' />
                    : active ? <Clock className='w-5 h-5' style={{ color: 'hsl(var(--accent))' }} />
                    : <Circle className='w-5 h-5 text-gray-300' />}
                </div>
                <div className='flex-1 min-w-0'>
                  <div className={'text-sm font-semibold ' + (done ? 'text-gray-700' : rejected ? 'text-red-700' : active ? '' : 'text-gray-400')}
                    style={active ? { color: 'hsl(var(--primary))' } : {}}>
                    {stageName}
                  </div>
                  {row?.remarks && <p className='text-xs text-gray-500 mt-0.5'>{row.remarks}</p>}
                  {row?.completedAt && <p className='text-xs text-gray-400 mt-0.5'>Completed: {new Date(row.completedAt).toLocaleDateString('en-IN')}</p>}
                  <p className='text-xs text-gray-400 mt-1'>Document requirements: see the latest admin remarks or contact your franchise manager.</p>
                </div>
                <span className={'text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ' + (done ? 'bg-green-50 text-green-700' : rejected ? 'bg-red-50 text-red-700' : active ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-400')}>
                  {done ? 'Completed' : rejected ? 'Rejected' : active ? 'In Progress' : 'Pending'}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Franchise Progress - RCF Portal</title><meta name="description" content="Track your franchise activation progress stage by stage." /><meta name='robots' content='noindex' /></Helmet>
      <DashboardLayout title='Franchise Progress' unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Franchise Progress – RCF Franchise Portal</h1>
        <ProgressContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}