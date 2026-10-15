import { Helmet } from '@dr.pogodin/react-helmet';
import { FormEvent, useState } from 'react';
import { CheckCircle, Circle, Clock, Search, XCircle } from 'lucide-react';
import { apiFetch } from '@/lib/useDashboard';

const STATUSES = [
  'submitted',
  'under_review',
  'documents_required',
  'approved',
  'agreement_pending',
  'payment_pending',
  'franchise_active',
];

interface ApplicationStatus {
  applicationId: string;
  status: string;
  createdAt: string;
}

export default function ApplicationStatusPage() {
  const [applicationId, setApplicationId] = useState('');
  const [application, setApplication] = useState<ApplicationStatus | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const lookup = async (event: FormEvent) => {
    event.preventDefault();
    const id = applicationId.trim().toUpperCase();
    if (!/^RCF-(?:[A-F0-9]{16}|\d{8}-[A-F0-9]{4})$/.test(id)) {
      setError('Enter the complete Application ID shown after submission.');
      setApplication(null);
      return;
    }

    setLoading(true);
    setError('');
    setApplication(null);
    try {
      setApplication(await apiFetch<ApplicationStatus>('/api/application-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id }),
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to retrieve application status.');
    } finally {
      setLoading(false);
    }
  };

  const isRejected = application?.status === 'rejected';
  const isOnHold = application?.status === 'on_hold';
  const currentIndex = application ? STATUSES.indexOf(application.status) : -1;

  return (
    <>
      <Helmet>
        <title>Check Application Status - RCF Franchise Portal</title>
        <meta name='robots' content='noindex' />
      </Helmet>
      <main className='min-h-screen px-4 py-12' style={{ background: 'hsl(var(--muted))' }}>
        <section className='mx-auto max-w-2xl space-y-6'>
          <header>
            <a href='/' className='text-sm font-semibold' style={{ color: 'hsl(var(--primary))' }}>RCF Franchise Portal</a>
            <h1 className='mt-4 text-2xl font-bold' style={{ color: 'hsl(var(--primary))' }}>Check application status</h1>
            <p className='mt-2 text-sm text-gray-600'>Use the private Application ID you received after submitting your application.</p>
          </header>

          <form onSubmit={lookup} className='flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row'>
            <label className='sr-only' htmlFor='application-id'>Application ID</label>
            <input
              id='application-id'
              className='min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm'
              value={applicationId}
              onChange={(event) => setApplicationId(event.target.value)}
              placeholder='RCF-XXXXXXXXXXXXXXXX (or your earlier RCF-YYYYMMDD-XXXX ID)'
              autoComplete='off'
              required
            />
            <button className='inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50'
              style={{ background: 'hsl(var(--primary))' }} disabled={loading}>
              <Search className='h-4 w-4' />{loading ? 'Checking…' : 'Check status'}
            </button>
          </form>

          {error && <p role='alert' className='rounded-xl bg-red-50 p-4 text-sm text-red-700'>{error}</p>}

          {application && (
            <section className='space-y-4 rounded-2xl bg-white p-5 shadow-sm' aria-live='polite'>
              <div className='flex flex-wrap items-start justify-between gap-3 border-b pb-4'>
                <div>
                  <p className='text-xs text-gray-500'>Application ID</p>
                  <p className='font-mono font-semibold'>{application.applicationId}</p>
                </div>
                <p className='text-xs text-gray-500'>Submitted {new Date(application.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
              <div className='flex items-center gap-2'>
                {isRejected ? <XCircle className='h-5 w-5 text-red-600' /> : <Clock className='h-5 w-5' style={{ color: 'hsl(var(--accent))' }} />}
                <p className='text-sm font-semibold capitalize'>{application.status.replace(/_/g, ' ')}</p>
              </div>
              {isRejected || isOnHold ? (
                <p className='text-sm text-gray-600'>
                  {isRejected
                    ? 'The application is marked rejected. Please contact the franchise team if you need clarification.'
                    : 'The application is on hold. Please contact the franchise team if you need clarification.'}
                </p>
              ) : (
                <ol className='space-y-3 border-l pl-4'>
                  {STATUSES.map((status, index) => {
                    const complete = currentIndex >= index;
                    const active = currentIndex === index;
                    return (
                      <li key={status} className='relative flex items-center gap-2 text-sm'>
                        {complete
                          ? <CheckCircle className='h-4 w-4 shrink-0 text-green-600' />
                          : active
                            ? <Clock className='h-4 w-4 shrink-0 text-amber-600' />
                            : <Circle className='h-4 w-4 shrink-0 text-gray-300' />}
                        <span className={complete ? 'text-gray-800' : 'text-gray-400'}>{status.replace(/_/g, ' ')}</span>
                      </li>
                    );
                  })}
                </ol>
              )}
              <p className='text-xs text-gray-500'>Eligibility and any eventual terms are subject to applicable requirements and company approval. This status page does not constitute an offer or approval.</p>
            </section>
          )}
        </section>
      </main>
    </>
  );
}
