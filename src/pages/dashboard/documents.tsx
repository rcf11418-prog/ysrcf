import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData, apiFetch } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { dashboard_modules } from 'virtual:content';

interface Doc {
  id: number; docType: string; docName: string; fileUrl: string;
  uploadedBy: string; expiryDate?: string; status: string; createdAt: string;
}

const typeColor: Record<string, string> = {
  agreement: 'hsl(var(--primary))',
  kyc: 'hsl(var(--secondary))',
  certificate: 'hsl(var(--accent))',
  other: '#6B7280',
};

function DocumentsContent() {
  const { data } = useDashboardData();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Doc[]>('/api/dashboard/documents')
      .then(setDocs).catch(() => {}).finally(() => setLoading(false));
  }, [data]);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          <h3 className="font-bold text-sm" style={{ color: 'hsl(var(--primary))' }}>{dashboard_modules.documents.title}</h3>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'hsl(var(--primary))' }} />
          </div>
        ) : docs.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm px-6">{dashboard_modules.documents.emptyText}</div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
            {docs.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: (typeColor[doc.docType] || typeColor.other) + '15' }}>
                  <FileText className="w-5 h-5" style={{ color: typeColor[doc.docType] || typeColor.other }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{doc.docName}</div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs capitalize px-2 py-0.5 rounded-full font-medium"
                      style={{ background: (typeColor[doc.docType] || typeColor.other) + '15', color: typeColor[doc.docType] || typeColor.other }}>
                      {doc.docType}
                    </span>
                    <span className="text-xs text-gray-400">Uploaded by {doc.uploadedBy}</span>
                    {doc.expiryDate && (
                      <span className="text-xs text-gray-400">Expires: {new Date(doc.expiryDate).toLocaleDateString('en-IN')}</span>
                    )}
                  </div>
                </div>
                <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
                  style={{ background: 'hsl(var(--primary)/0.08)', color: 'hsl(var(--primary))' }}>
                  <Download className="w-3.5 h-3.5" />
                  <ExternalLink className="w-3 h-3" />
                </a>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function DocumentsPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Documents - RCF Portal</title><meta name="description" content="Access your franchise agreements, KYC documents and certificates." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="Documents" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Documents – RCF Franchise Portal</h1>
        <DocumentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
