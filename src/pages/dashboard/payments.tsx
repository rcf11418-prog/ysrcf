import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData, apiFetch } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { dashboard_modules } from 'virtual:content';

interface Payment {
  id: number; transactionId: string; amount: string; paymentDate: string;
  paymentMode?: string; referenceNumber?: string; purpose?: string; status: string;
}
interface PaymentInstructions {
  paymentInstructionsPublished: boolean;
  paymentInstructions: {
    bankName: string; accountName: string; accountNumber: string; ifsc: string;
    branch: string; upiId: string; instructions: string;
  } | null;
}

function statusBadge(s: string) {
  if (s === 'completed') return 'bg-green-50 text-green-700';
  if (s === 'pending') return 'bg-amber-50 text-amber-700';
  return 'bg-red-50 text-red-700';
}

function StatusIcon({ s }: { s: string }) {
  if (s === 'completed') return <CheckCircle className="w-4 h-4 text-green-600" />;
  if (s === 'pending') return <Clock className="w-4 h-4 text-amber-500" />;
  return <XCircle className="w-4 h-4 text-red-500" />;
}

function PaymentsContent() {
  const { data } = useDashboardData();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentsError, setPaymentsError] = useState('');
  const [paymentInstructions, setPaymentInstructions] = useState<PaymentInstructions | null>(null);
  const [instructionsError, setInstructionsError] = useState('');

  useEffect(() => {
    apiFetch<Payment[]>('/api/dashboard/payments')
      .then(setPayments)
      .catch((error: unknown) => {
        console.error('dashboard.payments.load.failed', error);
        setPaymentsError(error instanceof Error ? error.message : 'Payment history is unavailable.');
      })
      .finally(() => setLoading(false));
    apiFetch<PaymentInstructions>('/api/franchise-settings', { cache: 'no-store' })
      .then(setPaymentInstructions)
      .catch((error: unknown) => {
        console.error('dashboard.payment-instructions.load.failed', error);
        setInstructionsError(error instanceof Error ? error.message : 'Current payment instructions are unavailable.');
      });
  }, []);

  const profile = data?.profile;
  const paid = Number(profile?.paidAmount ?? 0);
  const total = Number(profile?.totalInvestment ?? 0);
  const pending = Number(profile?.pendingAmount ?? 0);

  return (
    <div className="space-y-6 max-w-4xl">
      <section className="bg-white rounded-2xl p-5 shadow-sm">
        <h2 className="font-bold text-sm mb-3" style={{ color: 'hsl(var(--primary))' }}>Official payment instructions</h2>
        {instructionsError ? (
          <p role="alert" className="text-sm text-red-700">{instructionsError}</p>
        ) : !paymentInstructions ? (
          <p className="text-sm text-gray-500">Loading current instructions…</p>
        ) : !paymentInstructions.paymentInstructionsPublished || !paymentInstructions.paymentInstructions ? (
          <p className="text-sm text-gray-500">The company has not published payment instructions. Contact support before making a payment.</p>
        ) : (
          <div className="space-y-2 text-sm text-gray-700">
            {paymentInstructions.paymentInstructions.bankName && <p><strong>Bank:</strong> {paymentInstructions.paymentInstructions.bankName}</p>}
            {paymentInstructions.paymentInstructions.accountName && <p><strong>Account name:</strong> {paymentInstructions.paymentInstructions.accountName}</p>}
            {paymentInstructions.paymentInstructions.accountNumber && <p><strong>Account number:</strong> {paymentInstructions.paymentInstructions.accountNumber}</p>}
            {paymentInstructions.paymentInstructions.ifsc && <p><strong>IFSC:</strong> {paymentInstructions.paymentInstructions.ifsc}</p>}
            {paymentInstructions.paymentInstructions.branch && <p><strong>Branch:</strong> {paymentInstructions.paymentInstructions.branch}</p>}
            {paymentInstructions.paymentInstructions.upiId && <p><strong>UPI ID:</strong> {paymentInstructions.paymentInstructions.upiId}</p>}
            <p className="whitespace-pre-wrap">{paymentInstructions.paymentInstructions.instructions}</p>
            <p className="text-xs text-amber-700">Verify these official details before transferring funds. Payment instructions do not confirm or automatically record a payment.</p>
          </div>
        )}
      </section>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: dashboard_modules.payments.totalLabel, value: total, color: 'hsl(var(--primary))' },
          { label: dashboard_modules.payments.paidLabel, value: paid, color: 'hsl(var(--secondary))' },
          { label: dashboard_modules.payments.pendingLabel, value: pending, color: 'hsl(var(--accent))' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">{s.label}</div>
            <div className="text-2xl font-bold" style={{ color: s.color }}>
              {'\u20B9'}{s.value.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <h3 className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>{dashboard_modules.payments.title}</h3>
        </div>
        {paymentsError ? (
          <p role="alert" className="px-5 py-4 text-sm text-red-700">{paymentsError}</p>
        ) : loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))' }} />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{dashboard_modules.payments.emptyText}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-gray-500 font-semibold" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--muted))' }}>
                  <th className="px-5 py-3 text-left">Transaction ID</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Purpose</th>
                  <th className="px-5 py-3 text-left">Mode</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
                {payments.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td className="px-5 py-3 font-mono text-xs text-gray-600">{p.transactionId}</td>
                    <td className="px-5 py-3 text-gray-600">{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-gray-600">{p.purpose || '—'}</td>
                    <td className="px-5 py-3 text-gray-600">{p.paymentMode || '—'}</td>
                    <td className="px-5 py-3 text-right font-semibold">{'\u20B9'}{Number(p.amount).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className={'flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full w-fit ' + statusBadge(p.status)}>
                        <StatusIcon s={p.status} />{p.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PaymentsPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Payments - RCF Portal</title><meta name="description" content="View your payment history and investment summary." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="Payments" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Payments – RCF Franchise Portal</h1>
        <PaymentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
