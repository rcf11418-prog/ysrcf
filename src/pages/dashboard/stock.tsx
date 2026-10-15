import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData, apiFetch } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';

interface StockItem {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  unit: string;
  batchNumber: string;
  quantity: number;
  reserved: number;
  available: number;
  salePrice: string;
  stockValue: number;
  minStockLevel: number;
  isLow: boolean;
  isOut: boolean;
  expiryDate: string | null;
}

interface Movement {
  id: number;
  createdAt: string;
  sku: string;
  productName: string;
  batchNumber: string;
  movementType: string;
  quantity: number;
  referenceNumber: string | null;
  remarks: string | null;
}

interface StockResponse {
  items: StockItem[];
  movements: Movement[];
  summary: {
    totalQuantity: number;
    availableQuantity: number;
    reservedQuantity: number;
    stockValue: number;
    lowStock: number;
    outOfStock: number;
  };
}

const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

function StockContent() {
  const [stock, setStock] = useState<StockResponse | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<StockResponse>('/api/dashboard/stock')
      .then(setStock)
      .catch((e) => setError(String(e.message || e)));
  }, []);

  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!stock) return (
    <div className='flex items-center justify-center h-64'>
      <div className='w-8 h-8 rounded-full border-2 border-t-transparent animate-spin' style={{ borderColor: 'hsl(var(--primary))' }} />
    </div>
  );

  const s = stock.summary;
  const cards = [
    { label: 'Total Stock', value: s.totalQuantity.toLocaleString('en-IN') },
    { label: 'Available', value: s.availableQuantity.toLocaleString('en-IN') },
    { label: 'Reserved', value: s.reservedQuantity.toLocaleString('en-IN') },
    { label: 'Stock Value', value: inr(s.stockValue) },
    { label: 'Low Stock', value: String(s.lowStock) },
    { label: 'Out of Stock', value: String(s.outOfStock) },
  ];

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 lg:grid-cols-3 gap-3'>
        {cards.map((c) => (
          <div key={c.label} className='bg-white rounded-2xl p-4 shadow-sm'>
            <p className='text-xs text-gray-500'>{c.label}</p>
            <p className='text-lg font-bold mt-1' style={{ color: 'hsl(var(--primary))' }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
        <div className='px-5 py-4 border-b'>
          <h3 className='font-bold text-sm' style={{ color: 'hsl(var(--primary))' }}>Holdings</h3>
        </div>
        {stock.items.length === 0 ? (
          <p className='p-5 text-sm text-gray-400'>No stock allocated yet.</p>
        ) : (
          <table className='w-full text-sm'>
            <thead className='text-left text-xs text-gray-500 bg-gray-50'>
              <tr>
                <th className='px-4 py-2'>Product</th><th className='px-4 py-2'>SKU</th><th className='px-4 py-2'>Batch</th>
                <th className='px-4 py-2 text-right'>Qty</th><th className='px-4 py-2 text-right'>Available</th>
                <th className='px-4 py-2 text-right'>Sale-price value</th><th className='px-4 py-2'>Status</th>
              </tr>
            </thead>
            <tbody>
              {stock.items.map((i) => (
                <tr key={i.id} className='border-t'>
                  <td className='px-4 py-2'>{i.name}<div className='text-xs text-gray-400'>{i.category}</div></td>
                  <td className='px-4 py-2 font-mono text-xs'>{i.sku}</td>
                  <td className='px-4 py-2 font-mono text-xs'>{i.batchNumber || '—'}</td>
                  <td className='px-4 py-2 text-right'>{i.quantity} {i.unit}</td>
                  <td className='px-4 py-2 text-right'>{i.available}</td>
                  <td className='px-4 py-2 text-right'>{inr(i.stockValue)}</td>
                  <td className='px-4 py-2'>
                    <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + (i.isOut ? 'bg-red-50 text-red-700' : i.isLow ? 'bg-amber-50 text-amber-700' : 'bg-green-50 text-green-700')}>
                      {i.isOut ? 'Out of stock' : i.isLow ? 'Low stock' : 'In stock'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
        <div className='px-5 py-4 border-b'>
          <h3 className='font-bold text-sm' style={{ color: 'hsl(var(--primary))' }}>Stock Movement History</h3>
        </div>
        {stock.movements.length === 0 ? (
          <p className='p-5 text-sm text-gray-400'>No movements recorded.</p>
        ) : (
          <ul className='divide-y'>
            {stock.movements.map((m) => (
              <li key={m.id} className='px-5 py-3 text-sm flex flex-wrap justify-between gap-2'>
                <div>
                  <div className='font-semibold text-gray-700'>{m.productName} <span className='text-xs text-gray-400'>({m.sku})</span></div>
                  <div className='text-xs text-gray-500'>
                    {m.movementType.replace(/_/g, ' ')} · Batch {m.batchNumber || '—'}{m.referenceNumber ? ` · Ref ${m.referenceNumber}` : ''}
                  </div>
                  {m.remarks && <div className='text-xs text-gray-400'>{m.remarks}</div>}
                </div>
                <div className='text-right'>
                  <div className={'font-bold ' + (m.quantity < 0 ? 'text-red-600' : 'text-green-700')}>{m.quantity > 0 ? '+' : ''}{m.quantity}</div>
                  <div className='text-xs text-gray-400'>{new Date(m.createdAt).toLocaleDateString('en-IN')}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default function StockPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Stock & Inventory - RCF Portal</title><meta name="description" content="View your stock inventory and movement history." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="Stock & Inventory" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Stock & Inventory – RCF Franchise Portal</h1>
        <StockContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
