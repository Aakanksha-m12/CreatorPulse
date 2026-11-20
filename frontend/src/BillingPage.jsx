import { useEffect, useState } from 'react';
import AppShell from './AppShell';
import CreatorPulseLogo from './CreatorPulseLogo';
import { billingAPI } from './api';

const PLANS = [
  { id: 'free', name: 'Free', price: '₹0', period: 'forever', features: ['3 thumbnail scores / week', 'Basic social overview', 'Profile & niche setup', 'Posting-time lookup'] },
  { id: 'pro', name: 'Pro', price: '₹499', period: '/month', highlight: true, features: ['Unlimited thumbnail scoring', 'Full NLP optimizer', 'Posting-time recommendations', 'Hashtag & title optimizer', 'Priority processing'] },
  { id: 'studio', name: 'Studio', price: '₹1,199', period: '/month', features: ['Everything in Pro', 'Team of 5 seats', 'Real YouTube & Instagram API', 'Exportable reports'] },
];

/**
 * Module 6 — Payment & Subscription (frontend, Bootstrap + Razorpay Checkout).
 * Backend: /api/billing/order → Razorpay/mocked order; /verify → idempotent activation.
 * Webhook duplicates are ignored server-side (see SubscriptionService).
 */
export default function BillingPage() {
  const [status, setStatus] = useState(null);
  const [selected, setSelected] = useState('pro');
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(null);
  const [notice, setNotice] = useState('');

  const load = () => billingAPI.history().then((r) => setStatus(r.data)).catch(() => billingAPI.status().then((r) => setStatus(r.data)).catch(() => {}));
  useEffect(() => { load(); }, []);

  const pay = async () => {
    setError(''); setPaying(true);
    try {
      const plan = selected.toUpperCase();
      if (plan === 'FREE') { setError('Free needs no payment.'); setPaying(false); return; }
      const order = (await billingAPI.order(plan)).data;
      if (order.mockMode) {
        // Semester-demo mock checkout: no Razorpay keys configured.
        const mockPayment = `pay_mock_${Date.now()}`;
        const res = (await billingAPI.verify({ orderId: order.orderId, paymentId: mockPayment, signature: 'mock' })).data;
        setDone({ plan: res.plan, already: res.alreadyProcessed });
        localStorage.setItem('cp_plan', plan.toLowerCase());
        load();
      } else {
        // Live Razorpay Checkout.js
        await loadRazorpay();
        const rz = new window.Razorpay({
          key: order.keyId, amount: order.amount, currency: order.currency,
          name: 'CreatorPulse', description: `${plan} plan`,
          order_id: order.orderId,
          prefill: { email: order.prefillEmail, name: order.prefillName },
          handler: async (resp) => {
            try {
              const res = (await billingAPI.verify({
                orderId: resp.razorpay_order_id, paymentId: resp.razorpay_payment_id, signature: resp.razorpay_signature,
              })).data;
              setDone({ plan: res.plan, already: res.alreadyProcessed });
              localStorage.setItem('cp_plan', plan.toLowerCase());
              load();
            } catch (e) { setError(e.response?.data?.error || 'Verification failed'); }
          },
          modal: { ondismiss: () => setPaying(false) },
        });
        rz.open();
      }
    } catch (e) {
      setError(e.response?.data?.error || e.response?.data?.message || 'Payment failed');
    } finally { setPaying(false); }
  };

  return (
    <AppShell active="/premium">
      <div className="cp-module container-fluid py-3">
        <div className="text-center mb-4">
          <CreatorPulseLogo size={44} />
          <h2 className="fw-bold mt-2">Plans & Subscription</h2>
          <p className="text-secondary small mb-1">Razorpay checkout · subscription tracked per user · duplicate webhooks safely ignored.</p>
          {status && (
            <>
              <span className={`badge ${status.premium ? 'text-bg-success' : 'text-bg-secondary'}`}>
                Current: {status.plan} · {status.status}{status.premium ? ' · PREMIUM' : ''}
              </span>
              {status.status === 'ACTIVE' && (
                <div className="mt-2">
                  <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                    if (!confirm('Cancel your subscription? Premium stays until the paid period ends.')) return;
                    try { const r = await billingAPI.cancel(); setNotice(r.data?.message || 'Subscription cancelled'); setDone(null); load();
                    } catch (e) { setError(e.response?.data?.error || 'Cancellation failed'); }
                  }}>Cancel subscription</button>
                </div>
              )}
            </>
          )}
          {status?.mockMode && <div className="small text-warning mt-1">Demo mode — no Razorpay keys configured, mock checkout is used.</div>}
          {status?.currentPeriodEnd && status.status === 'ACTIVE' && (
            <div className="small text-success mt-1">Valid till {new Date(status.currentPeriodEnd).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
          )}
        </div>

        {(status?.payments || []).length > 0 && !done && (
          <div className="card mx-auto mb-4" style={{ maxWidth: 720 }}>
            <div className="card-header">Payment history</div>
            <div className="table-responsive">
              <table className="table table-sm mb-0">
                <thead><tr><th>Date</th><th>Plan</th><th>Amount</th><th>Payment ID</th><th>Valid till</th></tr></thead>
                <tbody>
                  {status.payments.map((p) => (
                    <tr key={p.paymentId}>
                      <td className="small">{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td><span className="badge text-bg-primary">{p.plan}</span></td>
                      <td>{p.amount}</td>
                      <td className="small text-secondary">{p.paymentId}</td>
                      <td className="small">{new Date(p.validTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {error && <div className="alert alert-danger">{error}</div>}
        {notice && <div className="alert alert-success">{notice}</div>}

        {done ? (
          <div className="card text-center mx-auto" style={{ maxWidth: 520 }}>
            <div className="card-body py-5">
              <div className="display-4">🎉</div>
              <h3 className="fw-bold mt-2">Welcome to {done.plan}!</h3>
              <p className="text-secondary">{done.already ? 'This payment was already confirmed — no double charge.' : 'Your subscription is active. Premium tools are unlocked.'}</p>
              <button className="btn btn-primary" onClick={() => setDone(null)}>Continue</button>
            </div>
          </div>
        ) : (
          <>
            <div className="row g-3 justify-content-center">
              {PLANS.map((p) => (
                <div key={p.id} className="col-md-4">
                  <div className={`card h-100 ${p.highlight ? 'border-primary' : ''} ${selected === p.id ? 'shadow' : ''}`}
                    style={{ cursor: 'pointer', borderWidth: selected === p.id ? 2 : 1 }} onClick={() => setSelected(p.id)}>
                    <div className="card-body">
                      {p.highlight && <span className="badge text-bg-primary mb-2">MOST POPULAR</span>}
                      <h4 className="fw-bold">{p.name} {selected === p.id && <span className="badge text-bg-success ms-1">✓</span>}</h4>
                      <div className="fs-3 fw-bold">{p.price}<small className="fs-6 text-secondary">{p.period}</small></div>
                      <ul className="small mt-3 mb-0">{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-4">
              <button className="btn btn-primary btn-lg px-5" disabled={paying || selected === 'free'} onClick={pay}>
                {paying ? 'Processing…' : selected === 'free' ? 'Free — no payment needed' : `Pay ${PLANS.find((p) => p.id === selected)?.price} with Razorpay`}
              </button>
              <p className="small text-secondary mt-2 mb-0">UPI · cards · netbanking via Razorpay · idempotent webhook handling</p>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = resolve; s.onerror = () => reject(new Error('Could not load Razorpay Checkout'));
    document.body.appendChild(s);
  });
}
