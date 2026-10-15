import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Download } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData, apiFetch } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { dashboard_modules } from 'virtual:content';

interface Invoice {
  id: number; invoiceNumber: string; invoiceDate: string; dueDate?: string;
  amount: string; taxAmount?: string; totalAmount: string; status: string;
  description?: string; fileUrl?: string;
}

function statusClass(s: string) {
  if (s === 'paid') return 'bg-green-50 text-green-700';
  if (s === 'overdue') return 'bg-red-50 text-red-700';
  return 'bg-amber-50 text-amber-700';
}

function InvoicesContent() {
  const { data } = useDashboardData();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Invoice[]>('/api/dashboard/invoices')
      .then(setInvoices).catch(() => {}).finally(() => setLoading(false));
  }, [data]);

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <h3 className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>{dashboard_modules.invoices.title}</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))' }} />
          </div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">{dashboard_modules.invoices.emptyText}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-gray-500 font-semibold" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--muted))' }}>
                  <th className="px-5 py-3 text-left">Invoice No.</th>
                  <th className="px-5 py-3 text-left">Date</th>
                  <th className="px-5 py-3 text-left">Due Date</th>
                  <th className="px-5 py-3 text-left">Description</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-right">Total</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-center">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
                {invoices.map((inv, i) => (
                  <motion.tr key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}>
                    <td className="px-5 py-3 font-mono text-xs">{inv.invoiceNumber}</td>
                    <td className="px-5 py-3 text-gray-600">{new Date(inv.invoiceDate).toLocaleDateString('en-IN')}</td>
                    <td className="px-5 py-3 text-gray-600">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString('en-IN') : '—'}</td>
                    <td className="px-5 py-3 text-gray-600 max-w-xs truncate">{inv.description || '—'}</td>
                    <td className="px-5 py-3 text-right">{'\u20B9'}{Number(inv.amount).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3 text-right font-semibold">{'\u20B9'}{Number(inv.totalAmount).toLocaleString('en-IN')}</td>
                    <td className="px-5 py-3">
                      <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + statusClass(inv.status)}>{inv.status}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {inv.fileUrl ? (
                        <a href={inv.fileUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-700">
                          <Download className="w-4 h-4 mx-auto" />
                        </a>
                      ) : <span className="text-gray-300">—</span>}
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

export default function InvoicesPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Invoices - RCF Portal</title><meta name="description" content="View and download your franchise invoices." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="Invoices" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Invoices – RCF Franchise Portal</h1>
        <InvoicesContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
