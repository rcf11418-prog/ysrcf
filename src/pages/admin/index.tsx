import { Helmet } from '@dr.pogodin/react-helmet';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ProtectedRoute } from '@/lib/auth/auth-client';
import { apiFetch } from '@/lib/useDashboard';
import { dashboard } from 'virtual:content';

const STAGES = dashboard.progressStages.map((s) => s.label);
const APP_STATUSES = ['submitted', 'under_review', 'documents_required', 'approved', 'rejected', 'agreement_pending', 'payment_pending', 'franchise_active', 'on_hold'];
const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const DELIVERY_STATUSES = ['order_received', 'processing', 'packed', 'dispatched', 'in_transit', 'out_for_delivery', 'delivered', 'partially_delivered', 'returned'];
const PAYMENT_MODES = ['NEFT', 'RTGS', 'Cheque', 'UPI', 'Cash'];
const TABS = ['Overview', 'Applications', 'Franchisees', 'Progress', 'Inventory', 'Deliveries', 'Payments', 'Tickets', 'Staff', 'Reports', 'Audit', 'Settings'] as const;
type Tab = (typeof TABS)[number];

interface Me { name: string; role: string; permissions: string[] }
interface Overview {
  franchisees: number; activeFranchisees: number; totalApplications: number;
  pendingApplications: number; openTickets: number; totalCollected?: number;
  totalInvestment?: number; profileOutstanding?: number; unverifiedAmount?: number; unverifiedPayments?: number;
  allocatedStockQuantity?: number; allocatedStockValue?: number; lowStockProducts?: number; outOfStockProducts?: number;
  pendingDeliveries?: number; completedDeliveries?: number;
}
interface Application { applicationId: string; fullName: string; mobile: string; email: string; city: string; state: string; franchiseType: string; preferredLocation: string; status: string; remarks: string | null; createdAt: string }
interface Franchisee { id: number; name: string; email: string; franchiseCode: string | null; city: string | null; progressStage: number; progressPercent: number; totalInvestment: string; paidAmount: string; pendingAmount: string }
interface Ticket { id: number; ticketNumber: string; subject: string; priority: string; status: string; franchiseeName: string; franchiseCode: string | null; createdAt: string }
interface AuditRow { id: number; createdAt: string; actorName: string | null; action: string; entityType: string; entityId: string | null; details: string | null }
interface AdminPayment {
  id: number; transactionId: string; franchiseeId: number; franchiseeName: string;
  franchiseCode: string | null; amount: string; paymentDate: string; paymentMode: string | null;
  referenceNumber: string | null; purpose: string | null; status: string; remarks: string | null;
}
interface AdminProduct {
  id: number; sku: string; name: string; category: string | null; unit: string;
  salePrice: string; gstRate: string; minStockLevel: number; quantity: number;
  reserved: number; available: number; stockValue: number; isLow: boolean; isOut: boolean;
}
interface AdminDelivery {
  id: number; deliveryId: string; orderId: number; orderNumber: string;
  franchiseeName: string; franchiseCode: string | null; warehouseId: number | null; warehouseName: string | null;
  transporter: string | null; vehicleNumber: string | null; driverName: string | null; trackingNumber: string | null;
  dispatchDate: string | null; expectedDeliveryDate: string | null; actualDeliveryDate: string | null;
  status: string; proofOfDeliveryUrl: string | null;
}
interface DeliveryConsole {
  deliveries: AdminDelivery[];
  warehouses: Array<{ id: number; name: string; code: string }>;
  availableOrders: Array<{ id: number; orderNumber: string; franchiseeId: number; franchiseeName: string }>;
}
interface AdminStaffRecord { userId: string; name: string; email: string; role: string }
interface StaffConsole {
  staff: AdminStaffRecord[];
  eligibleAccounts: Array<{ userId: string; name: string; email: string }>;
  roles: string[];
}
interface FranchiseAdminSettings {
  franchiseTypes: string[];
  investmentCategories: string[];
  company: { legalName: string; gstin: string; pan: string; registeredAddress: string; state: string; stateCode: string };
}
interface PaymentAdminSettings {
  details: { bankName: string; accountName: string; accountNumber: string; ifsc: string; branch: string; upiId: string; instructions: string };
  published: boolean;
  encryptionConfigured: boolean;
}

const inr = (n: number | string) => '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const input = 'w-full border rounded-lg px-3 py-2 text-sm';
const btn = 'px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50';
const btnStyle = { background: 'hsl(var(--primary))' };

function Message({ text, error }: { text: string; error?: boolean }) {
  if (!text) return null;
  return <p className={'text-sm ' + (error ? 'text-red-600' : 'text-green-700')}>{text}</p>;
}

function useLoad<T>(url: string | null, deps: unknown[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState('');
  const reload = useCallback(() => {
    if (!url) return;
    apiFetch<T>(url).then(setData).catch((e) => setError(String(e.message || e)));
  }, [url]);
  useEffect(() => { setData(null); reload(); }, [reload, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps
  return { data, error, reload };
}

function OverviewTab({ canViewPayments, canViewInventory, canViewDeliveries }: { canViewPayments: boolean; canViewInventory: boolean; canViewDeliveries: boolean }) {
  const { data, error } = useLoad<Overview>('/api/admin/overview');
  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!data) return <p className='text-sm text-gray-400'>Loading…</p>;
  const cards = [
    { label: 'Franchisees', value: data.franchisees },
    { label: 'Active franchises', value: data.activeFranchisees },
    { label: 'Total applications', value: data.totalApplications },
    { label: 'Pending applications', value: data.pendingApplications },
    { label: 'Open tickets', value: data.openTickets },
    ...(canViewPayments ? [
      { label: 'Admin-entered investment', value: inr(data.totalInvestment ?? 0) },
      { label: 'Profile outstanding balance', value: inr(data.profileOutstanding ?? 0) },
      { label: 'Verified payments collected', value: inr(data.totalCollected ?? 0) },
      { label: 'Unverified payment entries', value: data.unverifiedPayments ?? 0 },
      { label: 'Unverified payment amount', value: inr(data.unverifiedAmount ?? 0) },
    ] : []),
    ...(canViewInventory ? [
      { label: 'Franchisee-held stock quantity', value: data.allocatedStockQuantity ?? 0 },
      { label: 'Allocated stock sale-price value', value: inr(data.allocatedStockValue ?? 0) },
      { label: 'Low-stock products', value: data.lowStockProducts ?? 0 },
      { label: 'Out-of-stock products', value: data.outOfStockProducts ?? 0 },
    ] : []),
    ...(canViewDeliveries ? [
      { label: 'Pending deliveries', value: data.pendingDeliveries ?? 0 },
      { label: 'Completed deliveries', value: data.completedDeliveries ?? 0 },
    ] : []),
  ];
  return (
    <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3'>
      {cards.map((c) => (
        <div key={c.label} className='bg-white rounded-2xl p-4 shadow-sm'>
          <p className='text-xs text-gray-500'>{c.label}</p>
          <p className='text-lg font-bold mt-1' style={{ color: 'hsl(var(--primary))' }}>{c.value}</p>
        </div>
      ))}
      {(canViewInventory || canViewDeliveries) && <p className='col-span-full text-xs text-gray-500'>Inventory values are based on franchisee-held allocations and configured sale prices; central warehouse balances and purchase-cost valuations are not represented.</p>}
    </div>
  );
}

function ApplicationsTab({ canReview }: { canReview: boolean }) {
  const { data, error, reload } = useLoad<Application[]>('/api/admin/applications');
  const [edits, setEdits] = useState<Record<string, { status: string; remarks: string }>>({});
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);

  const save = async (a: Application) => {
    const e = edits[a.applicationId] ?? { status: a.status, remarks: a.remarks ?? '' };
    try {
      await apiFetch('/api/admin/applications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ applicationId: a.applicationId, status: e.status, remarks: e.remarks }) });
      setMsg(`Saved ${a.applicationId}`); setErr(false); reload();
    } catch (x) { setMsg(String((x as Error).message)); setErr(true); }
  };

  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!data) return <p className='text-sm text-gray-400'>Loading…</p>;
  return (
    <div className='space-y-3'>
      <Message text={msg} error={err} />
      {data.length === 0 && <p className='text-sm text-gray-400'>No applications yet.</p>}
      {data.map((a) => {
        const e = edits[a.applicationId] ?? { status: a.status, remarks: a.remarks ?? '' };
        return (
          <div key={a.applicationId} className='bg-white rounded-2xl p-4 shadow-sm space-y-2'>
            <div className='flex flex-wrap justify-between gap-2 text-sm'>
              <div><span className='font-semibold'>{a.fullName}</span> <span className='text-xs text-gray-400'>{a.applicationId}</span>
                <div className='text-xs text-gray-500'>{a.franchiseType} · {a.preferredLocation} · {a.city}, {a.state} · {a.mobile} · {a.email}</div>
              </div>
              <div className='text-xs text-gray-400'>{new Date(a.createdAt).toLocaleDateString('en-IN')}</div>
            </div>
            <div className='grid md:grid-cols-[200px_1fr_auto] gap-2 items-start'>
              <select className={input} value={e.status} disabled={!canReview} onChange={(ev) => setEdits({ ...edits, [a.applicationId]: { ...e, status: ev.target.value } })}>
                {APP_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
              <input className={input} placeholder='Remarks' value={e.remarks} disabled={!canReview} onChange={(ev) => setEdits({ ...edits, [a.applicationId]: { ...e, remarks: ev.target.value } })} />
              {canReview && <button className={btn} style={btnStyle} onClick={() => void save(a)}>Save</button>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function FranchiseesTab() {
  const { data, error } = useLoad<Franchisee[]>('/api/admin/franchisees');
  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!data) return <p className='text-sm text-gray-400'>Loading…</p>;
  if (data.length === 0) return <p className='text-sm text-gray-400'>No franchisees yet.</p>;
  return (
    <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead className='text-left text-xs text-gray-500 bg-gray-50'>
          <tr><th className='px-4 py-2'>Name</th><th className='px-4 py-2'>Code</th><th className='px-4 py-2'>City</th><th className='px-4 py-2'>Stage</th><th className='px-4 py-2 text-right'>Paid</th><th className='px-4 py-2 text-right'>Pending</th></tr>
        </thead>
        <tbody>
          {data.map((f) => (
            <tr key={f.id} className='border-t'>
              <td className='px-4 py-2'>{f.name}<div className='text-xs text-gray-400'>{f.email}</div></td>
              <td className='px-4 py-2 font-mono text-xs'>{f.franchiseCode ?? '—'}</td>
              <td className='px-4 py-2'>{f.city ?? '—'}</td>
              <td className='px-4 py-2'>{STAGES[f.progressStage] ?? '—'} <span className='text-xs text-gray-400'>({f.progressPercent}%)</span></td>
              <td className='px-4 py-2 text-right'>{inr(f.paidAmount)}</td>
              <td className='px-4 py-2 text-right'>{inr(f.pendingAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FranchiseePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { data } = useLoad<Franchisee[]>('/api/admin/franchisees');
  return (
    <select className={input} value={value} onChange={(e) => onChange(e.target.value)} required>
      <option value=''>Select franchisee…</option>
      {(data ?? []).map((f) => <option key={f.id} value={f.id}>{f.name} {f.franchiseCode ? `(${f.franchiseCode})` : ''}</option>)}
    </select>
  );
}

function ProgressTab() {
  const [franchiseeId, setFranchiseeId] = useState('');
  const [stage, setStage] = useState('0');
  const [status, setStatus] = useState('in_progress');
  const [percent, setPercent] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/progress', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        franchiseeId: Number(franchiseeId), stage: Number(stage), stageName: STAGES[Number(stage)], status, progressPercent: Number(percent), remarks,
      }) });
      setMsg('Progress updated and franchisee notified.'); setErr(false); setRemarks('');
    } catch (x) { setMsg(String((x as Error).message)); setErr(true); }
  };

  return (
    <form onSubmit={submit} className='bg-white rounded-2xl p-5 shadow-sm space-y-3 max-w-xl'>
      <FranchiseePicker value={franchiseeId} onChange={setFranchiseeId} />
      <div className='grid grid-cols-2 gap-3'>
        <select className={input} value={stage} onChange={(e) => setStage(e.target.value)}>
          {STAGES.map((s, i) => <option key={s} value={i}>{i}. {s}</option>)}
        </select>
        <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value='pending'>Pending</option><option value='in_progress'>In progress</option><option value='completed'>Completed</option><option value='rejected'>Rejected</option>
        </select>
      </div>
      <input className={input} type='number' min={0} max={100} value={percent} onChange={(e) => setPercent(e.target.value)} placeholder='Overall progress %' />
      <input className={input} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder='Remarks or required documents (shown to franchisee)' />
      <Message text={msg} error={err} />
      <button className={btn} style={btnStyle} disabled={!franchiseeId}>Update progress</button>
    </form>
  );
}

function PaymentsTab({ permissions }: { permissions: string[] }) {
  const { data, error, reload } = useLoad<AdminPayment[]>('/api/admin/payments');
  const paymentCategories = useLoad<{ categories: string[] }>('/api/admin/payment-categories');
  const [franchiseeId, setFranchiseeId] = useState('');
  const [amount, setAmount] = useState('');
  const [mode, setMode] = useState('NEFT');
  const [reference, setReference] = useState('');
  const [purposeCategory, setPurposeCategory] = useState('');
  const [purpose, setPurpose] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState(false);
  const canRecord = permissions.includes('*') || permissions.includes('payments.record');
  const canVerify = permissions.includes('*') || permissions.includes('payments.verify');
  const canRefund = permissions.includes('*') || permissions.includes('payments.refund');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiFetch<{ transactionId: string }>('/api/admin/payments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
        franchiseeId: Number(franchiseeId), amount: Number(amount), paymentMode: mode, referenceNumber: reference, purpose: purpose.trim() || purposeCategory,
      }) });
      setMsg(`Payment recorded as pending verification (${res.transactionId}).`); setErr(false); setAmount(''); setReference(''); setPurpose(''); setPurposeCategory(''); reload();
    } catch (x) { setMsg(String((x as Error).message)); setErr(true); }
  };

  async function updateStatus(payment: AdminPayment, status: 'completed' | 'failed' | 'refunded') {
    if (status === 'refunded' && !window.confirm(`Mark payment ${payment.transactionId} as refunded?`)) return;
    try {
      await apiFetch('/api/admin/payments', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.id, status }),
      });
      setMsg(`Payment ${payment.transactionId} marked ${status}.`);
      setErr(false);
      reload();
    } catch (x) {
      setMsg(String((x as Error).message));
      setErr(true);
    }
  }

  return (
    <div className='space-y-4'>
      {canRecord && (
        <form onSubmit={submit} className='bg-white rounded-2xl p-5 shadow-sm space-y-3 max-w-xl'>
          <h2 className='font-semibold text-sm'>Record a payment for verification</h2>
          <FranchiseePicker value={franchiseeId} onChange={setFranchiseeId} />
          <div className='grid grid-cols-2 gap-3'>
            <input className={input} type='number' min={0.01} max={9999999999.99} step='0.01' required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder='Amount (₹)' />
            <select className={input} value={mode} onChange={(e) => setMode(e.target.value)}>
              {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
            </select>
          </div>
          <input className={input} value={reference} onChange={(e) => setReference(e.target.value)} placeholder='Bank / UTR reference' />
          <select className={input} value={purposeCategory} onChange={(e) => setPurposeCategory(e.target.value)} required>
            <option value=''>Select configured payment category</option>
            {(paymentCategories.data?.categories ?? []).map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
          <input className={input} value={purpose} onChange={(e) => setPurpose(e.target.value)} placeholder='Optional custom purpose (overrides selected category)' maxLength={255} />
          {paymentCategories.error && <p role='alert' className='text-xs text-red-600'>Could not load payment categories: {paymentCategories.error}</p>}
          <Message text={msg} error={err} />
          <button className={btn} style={btnStyle} disabled={!franchiseeId || !amount}>Record as pending</button>
        </form>
      )}
      {!canRecord && <Message text={msg} error={err} />}
      {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
      {!data ? <p className='text-sm text-gray-400'>Loading payments…</p> : (
        <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='text-left text-xs text-gray-500 bg-gray-50'>
              <tr><th className='px-4 py-2'>Franchisee</th><th className='px-4 py-2'>Transaction</th><th className='px-4 py-2'>Date</th><th className='px-4 py-2'>Reference</th><th className='px-4 py-2 text-right'>Amount</th><th className='px-4 py-2'>Status / Actions</th></tr>
            </thead>
            <tbody>
              {data.map((p) => (
                <tr key={p.id} className='border-t'>
                  <td className='px-4 py-2'>{p.franchiseeName}<div className='text-xs text-gray-400'>{p.franchiseCode ?? 'No franchise code'}</div></td>
                  <td className='px-4 py-2 font-mono text-xs'>{p.transactionId}<div className='text-gray-400'>{p.paymentMode ?? '—'} · {p.purpose ?? 'Payment'}</div></td>
                  <td className='px-4 py-2'>{new Date(p.paymentDate).toLocaleDateString('en-IN')}</td>
                  <td className='px-4 py-2'>{p.referenceNumber ?? '—'}</td>
                  <td className='px-4 py-2 text-right'>{inr(p.amount)}</td>
                  <td className='px-4 py-2'>
                    <span className='capitalize'>{p.status}</span>
                    <div className='flex flex-wrap gap-1 mt-1'>
                      {p.status === 'pending' && canVerify && (
                        <>
                          <button className='text-xs font-semibold text-green-700' onClick={() => void updateStatus(p, 'completed')}>Verify</button>
                          <button className='text-xs font-semibold text-red-700' onClick={() => void updateStatus(p, 'failed')}>Mark failed</button>
                        </>
                      )}
                      {p.status === 'completed' && canRefund && (
                        <button className='text-xs font-semibold text-red-700' onClick={() => void updateStatus(p, 'refunded')}>Mark refunded</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {data.length === 0 && <tr><td className='px-4 py-6 text-gray-400' colSpan={6}>No payments recorded.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function InventoryTab({ permissions }: { permissions: string[] }) {
  const { data, error, reload } = useLoad<AdminProduct[]>('/api/admin/inventory');
  const [productId, setProductId] = useState('');
  const [franchiseeId, setFranchiseeId] = useState('');
  const [movementType, setMovementType] = useState('stock_in');
  const [quantity, setQuantity] = useState('');
  const [batchNumber, setBatchNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [sku, setSku] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('bag');
  const [salePrice, setSalePrice] = useState('');
  const [gstRate, setGstRate] = useState('0');
  const [minStockLevel, setMinStockLevel] = useState('0');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const canManage = permissions.includes('*') || permissions.includes('inventory.manage');

  const createProduct = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiFetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sku, name, category, unit, salePrice, gstRate, minStockLevel: Number(minStockLevel) }),
      });
      setMessage(`Product ${sku.toUpperCase()} created.`);
      setIsError(false);
      setSku(''); setName(''); setCategory(''); setSalePrice('');
      reload();
    } catch (x) {
      setMessage(String((x as Error).message));
      setIsError(true);
    }
  };

  const recordMovement = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiFetch('/api/admin/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: Number(productId),
          franchiseeId: Number(franchiseeId),
          movementType,
          quantity: Number(quantity),
          batchNumber,
          referenceNumber,
          remarks,
        }),
      });
      setMessage('Stock movement recorded and franchisee notified.');
      setIsError(false);
      setQuantity(''); setReferenceNumber(''); setRemarks('');
      reload();
    } catch (x) {
      setMessage(String((x as Error).message));
      setIsError(true);
    }
  };

  return (
    <div className='space-y-4'>
      {canManage && (
        <div className='grid gap-4 xl:grid-cols-2'>
          <form onSubmit={createProduct} className='bg-white rounded-2xl p-5 shadow-sm space-y-3'>
            <h2 className='font-semibold text-sm'>Add product</h2>
            <div className='grid sm:grid-cols-2 gap-3'>
              <input className={input} required maxLength={64} value={sku} onChange={(e) => setSku(e.target.value)} placeholder='SKU' />
              <input className={input} required maxLength={255} value={name} onChange={(e) => setName(e.target.value)} placeholder='Product name' />
              <input className={input} maxLength={100} value={category} onChange={(e) => setCategory(e.target.value)} placeholder='Category' />
              <input className={input} required maxLength={30} value={unit} onChange={(e) => setUnit(e.target.value)} placeholder='Unit (e.g. bag)' />
              <input className={input} required type='number' min={0} max={9999999999.99} step='0.01' value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder='Sale price (₹)' />
              <input className={input} required type='number' min={0} max={100} step='0.01' value={gstRate} onChange={(e) => setGstRate(e.target.value)} placeholder='GST rate (%)' />
              <input className={input} required type='number' min={0} step='1' value={minStockLevel} onChange={(e) => setMinStockLevel(e.target.value)} placeholder='Low stock threshold' />
            </div>
            <button className={btn} style={btnStyle}>Add product</button>
          </form>

          <form onSubmit={recordMovement} className='bg-white rounded-2xl p-5 shadow-sm space-y-3'>
            <h2 className='font-semibold text-sm'>Allocate or adjust franchisee stock</h2>
            <select className={input} required value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value=''>Select product…</option>
              {(data ?? []).map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
            <FranchiseePicker value={franchiseeId} onChange={setFranchiseeId} />
            <div className='grid sm:grid-cols-2 gap-3'>
              <select className={input} value={movementType} onChange={(e) => setMovementType(e.target.value)}>
                <option value='stock_in'>Stock in</option>
                <option value='stock_out'>Stock out</option>
                <option value='adjustment'>Set on-hand quantity</option>
                <option value='damaged'>Damaged stock</option>
                <option value='returned'>Returned stock</option>
              </select>
              <input className={input} required type='number' min={movementType === 'adjustment' ? 0 : 1} max={2147483647} step='1' value={quantity} onChange={(e) => setQuantity(e.target.value)}
                placeholder={movementType === 'adjustment' ? 'New on-hand quantity' : 'Quantity'} />
              <input className={input} maxLength={64} value={batchNumber} onChange={(e) => setBatchNumber(e.target.value)} placeholder='Batch number (optional)' />
              <input className={input} maxLength={50} value={referenceNumber} onChange={(e) => setReferenceNumber(e.target.value)} placeholder='Reference number' />
            </div>
            <input className={input} maxLength={2000} value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder='Remarks' />
            <button className={btn} style={btnStyle} disabled={!productId || !franchiseeId}>Record stock movement</button>
          </form>
        </div>
      )}
      <p className='text-xs text-gray-500'>Stock totals show franchisee-held allocations. Company warehouse balances are not represented in the current inventory data model.</p>
      <Message text={message} error={isError} />
      {error && <p role='alert' className='text-sm text-red-600'>{error}</p>}
      {!data ? <p className='text-sm text-gray-400'>Loading inventory…</p> : (
        <div className='bg-white rounded-2xl shadow-sm overflow-x-auto'>
          <table className='w-full text-sm'>
            <thead className='text-left text-xs text-gray-500 bg-gray-50'>
              <tr><th className='px-4 py-2'>Product</th><th className='px-4 py-2'>SKU</th><th className='px-4 py-2 text-right'>Sale price</th><th className='px-4 py-2 text-right'>Stock</th><th className='px-4 py-2 text-right'>Reserved</th><th className='px-4 py-2 text-right'>Sale-price value</th><th className='px-4 py-2'>Status</th></tr>
            </thead>
            <tbody>
              {(data ?? []).map((p) => (
                <tr key={p.id} className='border-t'>
                  <td className='px-4 py-2'>{p.name}<div className='text-xs text-gray-400'>{p.category ?? 'Uncategorized'} · {p.unit} · GST {p.gstRate}%</div></td>
                  <td className='px-4 py-2 font-mono text-xs'>{p.sku}</td>
                  <td className='px-4 py-2 text-right'>{inr(p.salePrice)}</td>
                  <td className='px-4 py-2 text-right'>{p.quantity}</td>
                  <td className='px-4 py-2 text-right'>{p.reserved}</td>
                  <td className='px-4 py-2 text-right'>{inr(p.stockValue)}</td>
                  <td className='px-4 py-2'>{p.isOut ? 'Out of stock' : p.isLow ? 'Low stock' : 'In stock'}</td>
                </tr>
              ))}
              {data.length === 0 && <tr><td className='px-4 py-6 text-gray-400' colSpan={7}>No products configured.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function TicketsTab() {
  const { data, error, reload } = useLoad<Ticket[]>('/api/admin/tickets');
  const [selected, setSelected] = useState<Ticket | null>(null);
  const [status, setStatus] = useState('');
  const [reply, setReply] = useState('');
  const [msg, setMsg] = useState('');

  const save = async () => {
    if (!selected) return;
    try {
      await apiFetch('/api/admin/tickets', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ticketId: selected.id, status: status || undefined, reply }) });
      setMsg('Ticket updated.'); setReply(''); reload();
    } catch (x) { setMsg(String((x as Error).message)); }
  };

  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!data) return <p className='text-sm text-gray-400'>Loading…</p>;
  return (
    <div className='grid lg:grid-cols-[1fr_1fr] gap-4'>
      <div className='bg-white rounded-2xl shadow-sm divide-y'>
        {data.length === 0 && <p className='p-4 text-sm text-gray-400'>No tickets.</p>}
        {data.map((t) => (
          <button key={t.id} onClick={() => { setSelected(t); setStatus(t.status); setMsg(''); }}
            className={'w-full text-left px-4 py-3 text-sm ' + (selected?.id === t.id ? 'bg-gray-50' : '')}>
            <div className='font-semibold'>{t.subject}</div>
            <div className='text-xs text-gray-500'>{t.ticketNumber} · {t.franchiseeName} · {t.priority} · {t.status.replace(/_/g, ' ')}</div>
          </button>
        ))}
      </div>
      {selected && (
        <div className='bg-white rounded-2xl p-5 shadow-sm space-y-3'>
          <h3 className='font-bold text-sm'>{selected.subject}</h3>
          <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
            {TICKET_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <textarea className={input} rows={4} value={reply} onChange={(e) => setReply(e.target.value)} placeholder='Reply to franchisee (optional)' />
          <Message text={msg} />
          <button className={btn} style={btnStyle} onClick={save}>Save</button>
        </div>
      )}
    </div>
  );
}

function DeliveryTab({ canManage }: { canManage: boolean }) {
  const { data, error, reload } = useLoad<DeliveryConsole>('/api/admin/deliveries');
  const [orderId, setOrderId] = useState('');
  const [warehouseId, setWarehouseId] = useState('');
  const [editWarehouseId, setEditWarehouseId] = useState('');
  const [expectedDate, setExpectedDate] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [status, setStatus] = useState('');
  const [editExpectedDate, setEditExpectedDate] = useState('');
  const [transporter, setTransporter] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const selected = data?.deliveries.find((delivery) => delivery.deliveryId === selectedId) ?? null;

  const createDelivery = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');
    try {
      await apiFetch('/api/admin/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: Number(orderId),
          warehouseId: warehouseId ? Number(warehouseId) : null,
          expectedDeliveryDate: expectedDate || null,
        }),
      });
      setMessage('Delivery created.');
      setIsError(false);
      setOrderId('');
      setWarehouseId('');
      setExpectedDate('');
      reload();
    } catch (e) {
      setIsError(true);
      setMessage(String((e as Error).message || e));
    }
  };

  const selectDelivery = (delivery: AdminDelivery) => {
    setSelectedId(delivery.deliveryId);
    setStatus(delivery.status);
    setEditWarehouseId(delivery.warehouseId ? String(delivery.warehouseId) : '');
    setEditExpectedDate(delivery.expectedDeliveryDate?.slice(0, 10) ?? '');
    setTransporter(delivery.transporter ?? '');
    setVehicleNumber(delivery.vehicleNumber ?? '');
    setDriverName(delivery.driverName ?? '');
    setTrackingNumber(delivery.trackingNumber ?? '');
    setProofUrl(delivery.proofOfDeliveryUrl ?? '');
    setMessage('');
    setIsError(false);
  };

  const saveDelivery = async (event: FormEvent) => {
    event.preventDefault();
    if (!selected) return;
    setMessage('');
    try {
      await apiFetch('/api/admin/deliveries', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliveryId: selected.deliveryId,
          status,
          warehouseId: editWarehouseId ? Number(editWarehouseId) : null,
          expectedDeliveryDate: editExpectedDate || null,
          transporter,
          vehicleNumber,
          driverName,
          trackingNumber,
          proofOfDeliveryUrl: proofUrl || null,
        }),
      });
      setMessage('Delivery updated.');
      setIsError(false);
      reload();
    } catch (e) {
      setIsError(true);
      setMessage(String((e as Error).message || e));
    }
  };

  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!data) return <p className='text-sm text-gray-400'>Loading…</p>;
  return (
    <div className='space-y-4'>
      {canManage && (
        <form onSubmit={createDelivery} className='grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-4'>
          <label className='text-xs text-gray-500'>Order
            <select className={input + ' mt-1'} value={orderId} onChange={(e) => setOrderId(e.target.value)} required>
              <option value=''>Select an order</option>
              {data.availableOrders.map((order) => <option key={order.id} value={order.id}>{order.orderNumber} · {order.franchiseeName}</option>)}
            </select>
          </label>
          <label className='text-xs text-gray-500'>Warehouse
            <select className={input + ' mt-1'} value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)}>
              <option value=''>Not assigned</option>
              {data.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name} ({warehouse.code})</option>)}
            </select>
          </label>
          <label className='text-xs text-gray-500'>Expected delivery
            <input className={input + ' mt-1'} type='date' value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} />
          </label>
          <div className='flex items-end'><button className={btn} style={btnStyle} disabled={!orderId}>Create delivery</button></div>
          {data.availableOrders.length === 0 && <p className='text-xs text-gray-500 md:col-span-4'>No undelivered orders are available.</p>}
        </form>
      )}
      <Message text={message} error={isError} />
      <div className='grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]'>
        <div className='divide-y rounded-2xl bg-white shadow-sm'>
          {data.deliveries.length === 0 && <p className='p-4 text-sm text-gray-400'>No deliveries recorded.</p>}
          {data.deliveries.map((delivery) => (
            <button key={delivery.id} onClick={() => selectDelivery(delivery)}
              className={'w-full px-4 py-3 text-left text-sm ' + (selectedId === delivery.deliveryId ? 'bg-gray-50' : '')}>
              <div className='font-semibold'>{delivery.deliveryId} · {delivery.orderNumber}</div>
              <div className='text-xs text-gray-500'>{delivery.franchiseeName} · {delivery.franchiseCode || 'No franchise code'} · {delivery.status.replace(/_/g, ' ')}</div>
              <div className='text-xs text-gray-400'>{delivery.trackingNumber || 'Tracking not added'}</div>
            </button>
          ))}
        </div>
        {selected && canManage && (
          <form onSubmit={saveDelivery} className='space-y-3 rounded-2xl bg-white p-5 shadow-sm'>
            <h2 className='text-sm font-bold'>Manage {selected.deliveryId}</h2>
            <label className='block text-xs text-gray-500'>Status
              <select className={input + ' mt-1'} value={status} onChange={(e) => setStatus(e.target.value)}>
                {DELIVERY_STATUSES.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
              </select>
            </label>
            <label className='block text-xs text-gray-500'>Expected delivery date
              <input className={input + ' mt-1'} type='date' value={editExpectedDate} onChange={(e) => setEditExpectedDate(e.target.value)} />
            </label>
            <label className='block text-xs text-gray-500'>Warehouse
              <select className={input + ' mt-1'} value={editWarehouseId} onChange={(e) => setEditWarehouseId(e.target.value)}>
                <option value=''>Not assigned</option>
                {data.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name} ({warehouse.code})</option>)}
              </select>
            </label>
            <div className='grid gap-3 sm:grid-cols-2'>
              <input className={input} value={transporter} onChange={(e) => setTransporter(e.target.value)} placeholder='Transporter' maxLength={150} />
              <input className={input} value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} placeholder='Vehicle number' maxLength={30} />
              <input className={input} value={driverName} onChange={(e) => setDriverName(e.target.value)} placeholder='Driver name' maxLength={100} />
              <input className={input} value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder='Tracking number' maxLength={60} />
            </div>
            <input className={input} type='url' value={proofUrl} onChange={(e) => setProofUrl(e.target.value)} placeholder='Proof-of-delivery HTTPS URL (optional)' />
            <p className='text-xs text-gray-500'>The portal stores an HTTPS proof link; it does not upload or host delivery documents.</p>
            <button className={btn} style={btnStyle}>Save delivery update</button>
          </form>
        )}
      </div>
      {!canManage && <p className='text-xs text-gray-500'>You have view-only delivery access.</p>}
    </div>
  );
}

function StaffTab() {
  const { data, error, reload } = useLoad<StaffConsole>('/api/admin/staff');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const assign = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await apiFetch('/api/admin/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      });
      setMessage('Staff role assigned.');
      setIsError(false);
      setUserId('');
      reload();
    } catch (e) {
      setIsError(true);
      setMessage(String((e as Error).message || e));
    }
  };

  const remove = async (staff: AdminStaffRecord) => {
    try {
      await apiFetch('/api/admin/staff', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: staff.userId }),
      });
      setMessage(`Staff access removed for ${staff.email}.`);
      setIsError(false);
      reload();
    } catch (e) {
      setIsError(true);
      setMessage(String((e as Error).message || e));
    }
  };

  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!data) return <p className='text-sm text-gray-400'>Loading…</p>;
  return (
    <div className='space-y-4'>
      <form onSubmit={assign} className='grid gap-3 rounded-2xl bg-white p-4 shadow-sm md:grid-cols-[1fr_1fr_auto]'>
        <select className={input} value={userId} onChange={(e) => setUserId(e.target.value)} required>
          <option value=''>Select a registered account</option>
          {data.eligibleAccounts.map((account) => <option key={account.userId} value={account.userId}>{account.name} · {account.email}</option>)}
        </select>
        <select className={input} value={role} onChange={(e) => setRole(e.target.value)} required>
          <option value=''>Select role</option>
          {data.roles.map((value) => <option key={value} value={value}>{value.replace(/_/g, ' ')}</option>)}
        </select>
        <button className={btn} style={btnStyle} disabled={!userId || !role}>Assign role</button>
        <p className='text-xs text-gray-500 md:col-span-3'>Only an already registered account can be assigned. This does not provision accounts or send invitations. Super-admin access remains controlled separately.</p>
      </form>
      <Message text={message} error={isError} />
      <div className='overflow-x-auto rounded-2xl bg-white shadow-sm'>
        <table className='w-full text-sm'>
          <thead className='bg-gray-50 text-left text-xs text-gray-500'>
            <tr><th className='px-4 py-2'>Staff member</th><th className='px-4 py-2'>Role</th><th className='px-4 py-2'>Access</th></tr>
          </thead>
          <tbody>
            {data.staff.map((staff) => (
              <tr className='border-t' key={staff.userId}>
                <td className='px-4 py-3'>{staff.name}<div className='text-xs text-gray-500'>{staff.email}</div></td>
                <td className='px-4 py-3 capitalize'>{staff.role.replace(/_/g, ' ')}</td>
                <td className='px-4 py-3'><button className='text-xs font-semibold text-red-700' onClick={() => void remove(staff)}>Remove access</button></td>
              </tr>
            ))}
            {data.staff.length === 0 && <tr><td className='px-4 py-6 text-gray-400' colSpan={3}>No staff roles assigned.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SettingsTab() {
  const settings = useLoad<FranchiseAdminSettings>('/api/admin/settings');
  const payments = useLoad<PaymentAdminSettings>('/api/admin/payment-settings');
  const [franchiseTypesText, setFranchiseTypesText] = useState('');
  const [investmentCategoriesText, setInvestmentCategoriesText] = useState('');
  const [company, setCompany] = useState<FranchiseAdminSettings['company']>({
    legalName: '', gstin: '', pan: '', registeredAddress: '', state: '', stateCode: '',
  });
  const [paymentDetails, setPaymentDetails] = useState<PaymentAdminSettings['details']>({
    bankName: '', accountName: '', accountNumber: '', ifsc: '', branch: '', upiId: '', instructions: '',
  });
  const [published, setPublished] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!settings.data) return;
    setFranchiseTypesText(settings.data.franchiseTypes.join('\n'));
    setInvestmentCategoriesText(settings.data.investmentCategories.join('\n'));
    setCompany(settings.data.company);
  }, [settings.data]);

  useEffect(() => {
    if (!payments.data) return;
    setPaymentDetails(payments.data.details);
    setPublished(payments.data.published);
  }, [payments.data]);

  const saveFranchiseSettings = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          franchiseTypes: franchiseTypesText.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
          investmentCategories: investmentCategoriesText.split(/\r?\n/).map((value) => value.trim()).filter(Boolean),
          company,
        }),
      });
      setMessage('Franchise and company settings saved.');
      setIsError(false);
      settings.reload();
    } catch (e) {
      setMessage(String((e as Error).message || e));
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const savePaymentSettings = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    try {
      await apiFetch('/api/admin/payment-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ details: paymentDetails, published }),
      });
      setMessage(published ? 'Encrypted payment settings saved and published to client portals.' : 'Encrypted payment settings saved as unpublished.');
      setIsError(false);
      payments.reload();
    } catch (e) {
      setMessage(String((e as Error).message || e));
      setIsError(true);
    } finally {
      setSaving(false);
    }
  };

  const setCompanyField = (field: keyof FranchiseAdminSettings['company'], value: string) =>
    setCompany((current) => ({ ...current, [field]: value }));
  const setPaymentField = (field: keyof PaymentAdminSettings['details'], value: string) =>
    setPaymentDetails((current) => ({ ...current, [field]: value }));

  return (
    <div className='space-y-5'>
      <Message text={message} error={isError} />
      {settings.error ? <p role='alert' className='text-sm text-red-600'>{settings.error}</p>
        : !settings.data ? <p className='text-sm text-gray-400'>Loading franchise settings…</p>
          : <form onSubmit={saveFranchiseSettings} className='space-y-4 rounded-2xl bg-white p-5 shadow-sm'>
        <div>
          <h2 className='font-bold' style={{ color: 'hsl(var(--primary))' }}>Franchise & company settings</h2>
          <p className='mt-1 text-xs text-gray-500'>Changes apply to new franchise applications; existing profiles are not rewritten.</p>
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          <label className='text-xs text-gray-600'>Franchise types (one per line)
            <textarea className={input + ' mt-1'} rows={5} maxLength={3000} value={franchiseTypesText} onChange={(e) => setFranchiseTypesText(e.target.value)} required />
          </label>
          <label className='text-xs text-gray-600'>Investment categories (one per line)
            <textarea className={input + ' mt-1'} rows={5} maxLength={3000} value={investmentCategoriesText} onChange={(e) => setInvestmentCategoriesText(e.target.value)} required />
          </label>
        </div>
        <p className='text-xs text-gray-500'>Categories configure the offering only; they do not create or change client charges. Amounts remain admin-entered per franchise profile.</p>
        <div className='grid gap-3 sm:grid-cols-2'>
          <label className='text-xs text-gray-600'>Company legal name<input className={input + ' mt-1'} maxLength={255} value={company.legalName} onChange={(e) => setCompanyField('legalName', e.target.value)} /></label>
          <label className='text-xs text-gray-600'>GSTIN<input className={input + ' mt-1'} maxLength={15} value={company.gstin} onChange={(e) => setCompanyField('gstin', e.target.value.toUpperCase())} /></label>
          <label className='text-xs text-gray-600'>PAN<input className={input + ' mt-1'} maxLength={10} value={company.pan} onChange={(e) => setCompanyField('pan', e.target.value.toUpperCase())} /></label>
          <label className='text-xs text-gray-600'>Registered state<input className={input + ' mt-1'} maxLength={100} value={company.state} onChange={(e) => setCompanyField('state', e.target.value)} /></label>
          <label className='text-xs text-gray-600'>GST state code<input className={input + ' mt-1'} maxLength={2} inputMode='numeric' value={company.stateCode} onChange={(e) => setCompanyField('stateCode', e.target.value)} /></label>
          <label className='text-xs text-gray-600 sm:col-span-2'>Registered address<textarea className={input + ' mt-1'} rows={3} maxLength={4000} value={company.registeredAddress} onChange={(e) => setCompanyField('registeredAddress', e.target.value)} /></label>
        </div>
        <button className={btn} style={btnStyle} disabled={saving}>{saving ? 'Saving…' : 'Save franchise settings'}</button>
          </form>}

      {payments.error ? <p role='alert' className='text-sm text-red-600'>{payments.error}</p>
        : !payments.data ? <p className='text-sm text-gray-400'>Loading finance settings…</p>
          : <form onSubmit={savePaymentSettings} className='space-y-4 rounded-2xl bg-white p-5 shadow-sm'>
        <div>
          <h2 className='font-bold' style={{ color: 'hsl(var(--primary))' }}>Finance & client payment instructions</h2>
          <p className='mt-1 text-xs text-gray-500'>Bank details are encrypted at rest using AES-256-GCM and shown to clients only when published. This configures manual bank/UPI instructions; it does not activate online payment processing.</p>
        </div>
        {!payments.data.encryptionConfigured && (
          <p className='rounded-lg bg-amber-50 p-3 text-sm text-amber-800'>Configure a persistent BANK_DETAILS_ENCRYPTION_KEY with 32 cryptographically random bytes (64 hex characters) in the server secret manager before saving or publishing bank details.</p>
        )}
        <div className='grid gap-3 sm:grid-cols-2'>
          <label className='text-xs text-gray-600'>Bank name<input className={input + ' mt-1'} maxLength={150} value={paymentDetails.bankName} onChange={(e) => setPaymentField('bankName', e.target.value)} /></label>
          <label className='text-xs text-gray-600'>Account name<input className={input + ' mt-1'} maxLength={255} value={paymentDetails.accountName} onChange={(e) => setPaymentField('accountName', e.target.value)} /></label>
          <label className='text-xs text-gray-600'>Account number<input className={input + ' mt-1'} maxLength={34} autoComplete='off' value={paymentDetails.accountNumber} onChange={(e) => setPaymentField('accountNumber', e.target.value)} /></label>
          <label className='text-xs text-gray-600'>IFSC<input className={input + ' mt-1'} maxLength={11} value={paymentDetails.ifsc} onChange={(e) => setPaymentField('ifsc', e.target.value.toUpperCase())} /></label>
          <label className='text-xs text-gray-600'>Branch<input className={input + ' mt-1'} maxLength={150} value={paymentDetails.branch} onChange={(e) => setPaymentField('branch', e.target.value)} /></label>
          <label className='text-xs text-gray-600'>UPI ID<input className={input + ' mt-1'} maxLength={256} value={paymentDetails.upiId} onChange={(e) => setPaymentField('upiId', e.target.value)} /></label>
          <label className='text-xs text-gray-600 sm:col-span-2'>Payment instructions<textarea className={input + ' mt-1'} rows={3} maxLength={4000} value={paymentDetails.instructions} onChange={(e) => setPaymentField('instructions', e.target.value)} /></label>
        </div>
        <label className='flex items-center gap-2 text-sm'>
          <input type='checkbox' checked={published} onChange={(e) => setPublished(e.target.checked)} />
          Publish official instructions to client portals and the public application settings endpoint
        </label>
        <button className={btn} style={btnStyle} disabled={saving || !payments.data.encryptionConfigured}>{saving ? 'Saving…' : 'Save finance settings'}</button>
          </form>}
    </div>
  );
}

function AuditTab() {
  const { data, error } = useLoad<AuditRow[]>('/api/admin/audit');
  if (error) return <p className='text-sm text-red-600'>{error}</p>;
  if (!data) return <p className='text-sm text-gray-400'>Loading…</p>;
  return (
    <ul className='bg-white rounded-2xl shadow-sm divide-y text-sm'>
      {data.length === 0 && <li className='p-4 text-gray-400'>No activity yet.</li>}
      {data.map((r) => (
        <li key={r.id} className='px-4 py-3 flex flex-wrap justify-between gap-2'>
          <span><b>{r.actorName || 'Staff'}</b> {r.action} <span className='text-gray-500'>{r.entityType} {r.entityId}</span></span>
          <span className='text-xs text-gray-400'>{new Date(r.createdAt).toLocaleString('en-IN')}</span>
        </li>
      ))}
    </ul>
  );
}

function ReportsTab({ permissions }: { permissions: string[] }) {
  const canAccess = (permission: string) => permissions.includes('*') || permissions.includes(permission);
  const reports = [
    { key: 'applications', label: 'Application report', permission: 'applications.view', description: 'Application ID, applicant, review status and location. Contact details are excluded.' },
    { key: 'franchises', label: 'Franchise report', permission: 'franchisees.view', description: 'Franchise status, progress and investment summary.' },
    { key: 'payments', label: 'Payment report', permission: 'payments.view', description: 'Recorded, verified and refunded franchise payments.' },
    { key: 'inventory', label: 'Inventory report', permission: 'inventory.view', description: 'Product catalogue and allocated/reserved franchisee stock.' },
    { key: 'movements', label: 'Inventory movement report', permission: 'inventory.view', description: 'Recorded product movement history with references and responsible user.' },
    { key: 'deliveries', label: 'Delivery report', permission: 'deliveries.view', description: 'Delivery status, transport details and expected/actual dates.' },
    { key: 'investment', label: 'Investment report', permission: 'franchisees.view', description: 'Admin-entered investment and payment summary by franchise.' },
    { key: 'outstanding', label: 'Outstanding payments report', permission: 'payments.view', description: 'Recorded franchise investment balances and paid amounts.' },
    { key: 'statewise', label: 'State-wise franchise report', permission: 'franchisees.view', description: 'Franchise and active-franchise counts by state.' },
    { key: 'staff-activity', label: 'Staff activity report', permission: 'audit.view', description: 'Recent staff audit events and recorded action details.' },
  ].filter((report) => canAccess(report.permission));

  return (
    <div className='grid gap-3 md:grid-cols-2'>
      {reports.map((report) => (
        <section key={report.key} className='bg-white rounded-2xl p-5 shadow-sm'>
          <h2 className='font-semibold text-sm'>{report.label}</h2>
          <p className='mt-1 mb-4 text-xs text-gray-500'>{report.description}</p>
          <a href={`/api/admin/reports?report=${report.key}`}
            className='inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white'
            style={btnStyle}>Download CSV</a>
        </section>
      ))}
      {reports.length === 0 && <p className='text-sm text-gray-500'>No reports are available for your role.</p>}
      <p className='md:col-span-2 text-xs text-gray-500'>Exports are limited to stored portal records (up to 5,000 rows per report), use role permissions, and are audit logged. Excel/PDF formats and date filters are not configured.</p>
    </div>
  );
}

function AdminContent() {
  const [me, setMe] = useState<Me | null>(null);
  const [denied, setDenied] = useState('');
  const [tab, setTab] = useState<Tab>('Overview');

  useEffect(() => {
    apiFetch<Me>('/api/admin/me').then(setMe).catch((e) => setDenied(String(e.message || e)));
  }, []);

  if (denied) return <p className='text-sm text-red-600'>{denied === 'Staff access required' ? 'You do not have staff access to this panel.' : denied}</p>;
  if (!me) return <p className='text-sm text-gray-400'>Loading…</p>;

  const canAccess = (permission: string) => me.permissions.includes('*') || me.permissions.includes(permission);
  const tabPermission: Record<Tab, string> = {
    Overview: 'franchisees.view',
    Applications: 'applications.view',
    Franchisees: 'franchisees.view',
    Progress: 'progress.update',
    Inventory: 'inventory.view',
    Deliveries: 'deliveries.view',
    Payments: 'payments.view',
    Tickets: 'tickets.manage',
    Staff: 'staff.manage',
    Reports: 'reports.export',
    Audit: 'audit.view',
    Settings: 'settings.view',
  };
  const visibleTabs = TABS.filter((t) => canAccess(tabPermission[t]));

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap gap-2'>
        {visibleTabs.map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={'px-3 py-1.5 rounded-full text-sm font-semibold ' + (tab === t ? 'text-white' : 'bg-white text-gray-600 shadow-sm')}
            style={tab === t ? btnStyle : undefined}>{t}</button>
        ))}
      </div>
      <p className='text-xs text-gray-500'>Signed in as {me.name} · role: {me.role.replace(/_/g, ' ')}</p>
      {tab === 'Overview' && <OverviewTab canViewPayments={canAccess('payments.view')} canViewInventory={canAccess('inventory.view')} canViewDeliveries={canAccess('deliveries.view')} />}
      {tab === 'Applications' && <ApplicationsTab canReview={canAccess('applications.review')} />}
      {tab === 'Franchisees' && <FranchiseesTab />}
      {tab === 'Progress' && <ProgressTab />}
      {tab === 'Inventory' && canAccess('inventory.view') && <InventoryTab permissions={me.permissions} />}
      {tab === 'Deliveries' && canAccess('deliveries.view') && <DeliveryTab canManage={canAccess('deliveries.manage')} />}
      {tab === 'Payments' && canAccess('payments.view') && <PaymentsTab permissions={me.permissions} />}
      {tab === 'Tickets' && canAccess('tickets.manage') && <TicketsTab />}
      {tab === 'Staff' && canAccess('staff.manage') && <StaffTab />}
      {tab === 'Reports' && canAccess('reports.export') && <ReportsTab permissions={me.permissions} />}
      {tab === 'Audit' && canAccess('audit.view') && <AuditTab />}
      {tab === 'Settings' && canAccess('settings.view') && <SettingsTab />}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <Helmet><title>Admin Panel - RCF Portal</title><meta name='robots' content='noindex' /></Helmet>
      <main className='min-h-screen p-6' style={{ background: 'hsl(var(--muted))' }}>
        <h1 className='text-xl font-bold mb-6' style={{ color: 'hsl(var(--primary))' }}>RCF Admin Panel</h1>
        <AdminContent />
      </main>
    </ProtectedRoute>
  );
}
