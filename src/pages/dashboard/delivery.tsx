import { Helmet } from '@dr.pogodin/react-helmet';
import { useEffect, useState, type FormEvent } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useDashboardData, apiFetch } from '@/lib/useDashboard';
import { ProtectedRoute } from '@/lib/auth/auth-client';

interface OrderItem { sku: string; productName: string; unit: string; quantity: number; rate: number; }
interface Order { id: number; orderId: string; status: string; totalAmount: number; createdAt: string; items: OrderItem[]; }
interface OrderProduct { id: number; sku: string; name: string; unit: string; rate: string; }
interface Delivery {
  id: number;
  deliveryId: string;
  orderId: number;
  warehouseName: string | null;
  transporter: string | null;
  vehicleNumber: string | null;
  driverName: string | null;
  trackingNumber: string | null;
  dispatchDate: string | null;
  expectedDeliveryDate: string | null;
  actualDeliveryDate: string | null;
  status: string;
  proofOfDeliveryUrl: string | null;
}
interface DeliveriesResponse { orders: Order[]; deliveries: Delivery[]; products: OrderProduct[]; }

const STATUS_LABELS: Record<string, string> = {
  order_received: 'Order Received',
  processing: 'Processing',
  packed: 'Packed',
  dispatched: 'Dispatched',
  in_transit: 'In Transit',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  partially_delivered: 'Partially Delivered',
  returned: 'Returned',
};

const STATUS_STYLE = (s: string) =>
  s === 'delivered' ? 'bg-green-50 text-green-700'
    : s === 'returned' ? 'bg-red-50 text-red-700'
    : s === 'partially_delivered' ? 'bg-amber-50 text-amber-700'
    : 'bg-blue-50 text-blue-700';

const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString('en-IN') : '—');
const inr = (n: number) => '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 2 });

function DeliveryContent() {
  const [data, setData] = useState<DeliveriesResponse | null>(null);
  const [error, setError] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [lines, setLines] = useState([{ productId: '', quantity: '1' }]);
  const [orderMessage, setOrderMessage] = useState('');
  const [orderError, setOrderError] = useState(false);

  useEffect(() => {
    apiFetch<DeliveriesResponse>('/api/dashboard/deliveries')
      .then(setData)
      .catch((e) => setError(String(e.message || e)));
  }, [refresh]);

  const submitOrder = async (event: FormEvent) => {
    event.preventDefault();
    setOrderMessage('');
    try {
      const response = await apiFetch<{ orderId: string }>('/api/dashboard/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: lines.map((line) => ({ productId: Number(line.productId), quantity: Number(line.quantity) })),
        }),
      });
      setOrderMessage(`Order request ${response.orderId} was submitted. Availability and fulfillment require confirmation.`);
      setOrderError(false);
      setLines([{ productId: '', quantity: '1' }]);
      setRefresh((value) => value + 1);
    } catch (e) {
      setOrderMessage(String((e as Error).message || e));
      setOrderError(true);
    }
  };

  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!data) return (
    <div className='flex items-center justify-center h-64'>
      <div className='w-8 h-8 rounded-full border-2 border-t-transparent animate-spin' style={{ borderColor: 'hsl(var(--primary))' }} />
    </div>
  );

  const pending = data.deliveries.filter((d) => d.status !== 'delivered' && d.status !== 'returned').length;
  const completed = data.deliveries.filter((d) => d.status === 'delivered').length;

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-3 gap-3'>
        <div className='bg-white rounded-2xl p-4 shadow-sm'><p className='text-xs text-gray-500'>Orders</p><p className='text-lg font-bold' style={{ color: 'hsl(var(--primary))' }}>{data.orders.length}</p></div>
        <div className='bg-white rounded-2xl p-4 shadow-sm'><p className='text-xs text-gray-500'>Pending Deliveries</p><p className='text-lg font-bold' style={{ color: 'hsl(var(--primary))' }}>{pending}</p></div>
        <div className='bg-white rounded-2xl p-4 shadow-sm'><p className='text-xs text-gray-500'>Completed</p><p className='text-lg font-bold' style={{ color: 'hsl(var(--primary))' }}>{completed}</p></div>
      </div>

      <form onSubmit={submitOrder} className='space-y-4 rounded-2xl bg-white p-5 shadow-sm'>
        <div>
          <h2 className='font-bold text-sm' style={{ color: 'hsl(var(--primary))' }}>Request a product order</h2>
          <p className='mt-1 text-xs text-gray-500'>Requests are subject to stock availability and company confirmation. This portal does not currently reserve central warehouse stock or calculate GST.</p>
        </div>
        {data.products.length === 0 ? <p className='text-sm text-gray-400'>No products are currently configured for order requests.</p> : (
          <div className='space-y-3'>
            {lines.map((line, index) => {
              const selectedProduct = data.products.find((product) => product.id === Number(line.productId));
              return (
                <div key={index} className='grid gap-2 sm:grid-cols-[1fr_8rem_auto]'>
                  <select className='w-full border rounded-lg px-3 py-2 text-sm' value={line.productId} required
                    onChange={(event) => setLines((current) => current.map((item, i) => i === index ? { ...item, productId: event.target.value } : item))}>
                    <option value=''>Select product</option>
                    {data.products.map((product) => (
                      <option key={product.id} value={product.id}
                        disabled={lines.some((other, i) => i !== index && Number(other.productId) === product.id)}>
                        {product.name} ({product.sku}) · {inr(Number(product.rate))}
                      </option>
                    ))}
                  </select>
                  <input className='w-full border rounded-lg px-3 py-2 text-sm' type='number' min={1} max={1000000} step={1} required value={line.quantity}
                    aria-label='Quantity'
                    onChange={(event) => setLines((current) => current.map((item, i) => i === index ? { ...item, quantity: event.target.value } : item))} />
                  <button type='button' className='rounded-lg border px-3 py-2 text-xs text-gray-600 disabled:opacity-40' disabled={lines.length === 1}
                    onClick={() => setLines((current) => current.filter((_, i) => i !== index))}>Remove</button>
                  {selectedProduct && <p className='text-xs text-gray-500 sm:col-span-3'>{selectedProduct.unit} · Price before any applicable tax: {inr(Number(selectedProduct.rate))} per unit</p>}
                </div>
              );
            })}
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <button type='button' className='text-sm font-semibold' style={{ color: 'hsl(var(--primary))' }}
                disabled={lines.length >= 50}
                onClick={() => setLines((current) => [...current, { productId: '', quantity: '1' }])}>Add product</button>
              <button className='rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50' style={{ background: 'hsl(var(--primary))' }}
                disabled={lines.some((line) => !line.productId || !/^[1-9]\d*$/.test(line.quantity) || Number(line.quantity) > 1000000)}>Submit order request</button>
            </div>
          </div>
        )}
        {orderMessage && <p className={'text-sm ' + (orderError ? 'text-red-600' : 'text-green-700')}>{orderMessage}</p>}
      </form>

      {data.orders.length === 0 ? (
        <p className='text-sm text-gray-400 bg-white rounded-2xl p-8 text-center shadow-sm'>No orders yet. Submit an order request above to get started.</p>
      ) : data.orders.map((o) => {
        const ds = data.deliveries.filter((d) => d.orderId === o.id);
        return (
          <div key={o.id} className='bg-white rounded-2xl shadow-sm overflow-hidden'>
            <div className='px-5 py-4 border-b flex flex-wrap justify-between gap-2'>
              <div>
                <h3 className='font-bold text-sm' style={{ color: 'hsl(var(--primary))' }}>Order {o.orderId}</h3>
                <p className='text-xs text-gray-500'>Placed {fmtDate(o.createdAt)} · Total {inr(o.totalAmount)}</p>
              </div>
              <span className={'text-xs font-semibold px-2 py-0.5 rounded-full self-start ' + STATUS_STYLE(o.status)}>{STATUS_LABELS[o.status] ?? o.status}</span>
            </div>
            <ul className='px-5 py-3 text-sm divide-y'>
              {o.items.map((i) => (
                <li key={i.sku} className='py-2 flex justify-between gap-2'>
                  <span>{i.productName} <span className='text-xs text-gray-400'>({i.sku})</span></span>
                  <span className='text-gray-600'>{i.quantity} {i.unit} × {inr(i.rate)}</span>
                </li>
              ))}
            </ul>
            {ds.map((d) => (
              <div key={d.id} className='px-5 py-4 border-t bg-gray-50 text-sm space-y-1'>
                <div className='flex flex-wrap justify-between gap-2'>
                  <span className='font-semibold'>Delivery {d.deliveryId}</span>
                  <span className={'text-xs font-semibold px-2 py-0.5 rounded-full ' + STATUS_STYLE(d.status)}>{STATUS_LABELS[d.status] ?? d.status}</span>
                </div>
                <div className='grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600'>
                  <span>Warehouse: {d.warehouseName ?? '—'}</span>
                  <span>Tracking No.: {d.trackingNumber ?? '—'}</span>
                  <span>Transporter: {d.transporter ?? '—'}</span>
                  <span>Vehicle: {d.vehicleNumber ?? '—'}</span>
                  <span>Driver: {d.driverName ?? '—'}</span>
                  <span>Dispatched: {fmtDate(d.dispatchDate)}</span>
                  <span>Expected: {fmtDate(d.expectedDeliveryDate)}</span>
                  <span>Delivered: {fmtDate(d.actualDeliveryDate)}</span>
                </div>
                {d.proofOfDeliveryUrl && (
                  <a href={d.proofOfDeliveryUrl} target='_blank' rel='noopener noreferrer' className='text-xs font-semibold underline' style={{ color: 'hsl(var(--primary))' }}>
                    View proof of delivery
                  </a>
                )}
              </div>
            ))}
            {ds.length === 0 && <p className='px-5 py-3 text-xs text-gray-400 border-t'>Delivery not yet created.</p>}
          </div>
        );
      })}
    </div>
  );
}

export default function DeliveryPage() {
  const { data } = useDashboardData();
  return (
    <ProtectedRoute>
      <Helmet><title>Delivery Tracking - RCF Portal</title><meta name="description" content="Track your franchise product deliveries." /><meta name="robots" content="noindex" /></Helmet>
      <DashboardLayout title="Orders & Deliveries" unreadCount={data?.stats?.unreadNotifications ?? 0}>
        <h1 className="sr-only">Delivery Tracking – RCF Franchise Portal</h1>
        <DeliveryContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
