"use client";
import { useState, useEffect, useCallback } from "react";

// ─── API helper (same pattern as main app) ──────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function api(path, opts = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("cf_token") : null;
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opts.headers,
    },
  });
  if (res.status === 401) {
    localStorage.removeItem("cf_token");
    localStorage.removeItem("cf_refresh");
    window.location.href = "/";
  }
  return res;
}

// ─── Plan & pack data (mirrors backend, used as fallback) ───────
const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    credits: 3,
    period: "forever",
    features: [
      "3 videos per month",
      "720p quality",
      "Watermark on exports",
      "3 video formats",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: 749,
    credits: 15,
    period: "month",
    features: [
      "15 videos per month",
      "1080p quality",
      "No watermark",
      "All 6 formats",
      "Email support",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: 1599,
    credits: 40,
    period: "month",
    popular: true,
    features: [
      "40 videos per month",
      "1080p quality",
      "No watermark",
      "All 6 formats",
      "Priority rendering queue",
      "Custom voice selection",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: 4099,
    credits: 120,
    period: "month",
    features: [
      "120 videos per month",
      "4K quality",
      "No watermark",
      "All 6 formats",
      "Priority queue",
      "Custom voices",
      "API access",
      "Bulk generation",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: 8299,
    credits: 300,
    period: "month",
    features: [
      "300 videos per month",
      "4K quality",
      "No watermark",
      "All 6 formats",
      "Dedicated queue",
      "Custom voices",
      "API access",
      "White-label option",
      "Team accounts",
    ],
  },
];

const CREDIT_PACKS = [
  { id: "credits_5", amount: 5, price: 419, label: "5 Credits" },
  { id: "credits_15", amount: 15, price: 1099, label: "15 Credits", popular: true },
  { id: "credits_50", amount: 50, price: 3399, label: "50 Credits" },
  { id: "credits_100", amount: 100, price: 5899, label: "100 Credits" },
];

// ─── Styles ────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#08090D;--bg2:#0E1017;--card:#13151F;--elev:#1F2233;--b1:rgba(255,255,255,.04);--b2:rgba(255,255,255,.08);--b3:rgba(255,255,255,.12);--t1:#F4F4F7;--t2:#9598A8;--t3:#5C5F72;--acc:#FF6B35;--acc-g:linear-gradient(135deg,#FF6B35,#FF9F6B);--violet:#7B61FF;--green:#34D399;--red:#EF4444;--r:10px;--r2:14px;--r3:20px;--glass:rgba(19,21,31,.72);--glass-b:saturate(180%) blur(20px);--shadow:0 4px 24px rgba(0,0,0,.4);--glow:0 0 40px rgba(255,107,53,.15)}

.pr-app{background:var(--bg);min-height:100vh;color:var(--t1);font-family:'Plus Jakarta Sans',system-ui,sans-serif}
.pr-app::before{content:'';position:fixed;top:-50%;left:-50%;width:200%;height:200%;background:radial-gradient(circle at 30% 20%,rgba(123,97,255,.04),transparent 50%),radial-gradient(circle at 70% 80%,rgba(255,107,53,.03),transparent 50%);pointer-events:none;z-index:0}

/* ── Header ── */
.pr-hdr{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-bottom:1px solid var(--b1);background:var(--glass);backdrop-filter:var(--glass-b);-webkit-backdrop-filter:var(--glass-b);position:sticky;top:0;z-index:100}
.pr-logo{display:flex;align-items:center;gap:10px;cursor:pointer;text-decoration:none;color:inherit}
.pr-logo-m{width:34px;height:34px;background:var(--acc-g);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;font-family:'Space Mono',monospace;box-shadow:0 0 20px rgba(255,107,53,.3)}
.pr-logo-t{font-size:19px;font-weight:800;letter-spacing:-.5px}
.pr-logo-t em{font-style:normal;background:var(--acc-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.pr-hdr-r{display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.pr-cr-badge{display:flex;align-items:center;gap:6px;background:var(--card);padding:7px 14px;border-radius:100px;border:1px solid var(--b2);font-size:13px;color:var(--t2)}
.pr-cr-n{color:var(--acc);font-weight:700;font-family:'Space Mono',monospace}
.pr-back-btn{background:none;border:1px solid var(--b2);color:var(--t2);padding:7px 16px;border-radius:var(--r);font-size:13px;cursor:pointer;font-family:inherit;transition:all .2s;text-decoration:none;display:inline-flex;align-items:center;gap:6px}
.pr-back-btn:hover{border-color:var(--acc);color:var(--acc)}

/* ── Hero ── */
.pr-hero{text-align:center;padding:52px 24px 16px;position:relative;z-index:1;max-width:680px;margin:0 auto}
.pr-hero-title{font-size:32px;font-weight:800;letter-spacing:-.7px;line-height:1.2;margin-bottom:10px}
.pr-hero-title em{font-style:normal;background:var(--acc-g);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.pr-hero-sub{color:var(--t2);font-size:15px;line-height:1.7;max-width:520px;margin:0 auto}

/* ── Tab toggle ── */
.pr-tabs{display:flex;justify-content:center;margin:32px auto 36px;gap:4px;background:var(--card);border:1px solid var(--b1);border-radius:var(--r);padding:4px;width:fit-content}
.pr-tab{padding:10px 24px;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;transition:all .25s;color:var(--t2);border:none;background:none;font-family:inherit}
.pr-tab.on{background:var(--acc-g);color:#fff;box-shadow:0 2px 12px rgba(255,107,53,.25)}
.pr-tab:not(.on):hover{color:var(--t1)}

/* ── Plan grid ── */
.pr-content{max-width:1200px;margin:0 auto;padding:0 20px 80px;position:relative;z-index:1}
.pr-plan-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(215px,1fr));gap:14px;align-items:start}
@media(max-width:600px){.pr-plan-grid{grid-template-columns:1fr}}

/* ── Plan card ── */
.pr-plan{background:var(--card);border:1px solid var(--b1);border-radius:var(--r2);padding:28px 22px;position:relative;transition:all .3s;display:flex;flex-direction:column}
.pr-plan:hover{border-color:var(--b3);transform:translateY(-2px);box-shadow:var(--shadow)}
.pr-plan.pop{border-color:rgba(255,107,53,.35);box-shadow:0 0 0 1px rgba(255,107,53,.15),var(--glow)}
.pr-plan.pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--acc-g);border-radius:14px 14px 0 0}
.pr-plan.current{border-color:rgba(52,211,153,.3);box-shadow:0 0 0 1px rgba(52,211,153,.15)}
.pr-plan.current::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(135deg,#10B981,#34D399);border-radius:14px 14px 0 0}

.pr-plan-badge{position:absolute;top:14px;right:14px;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:4px 10px;border-radius:6px}
.pr-plan-badge.pop-badge{background:rgba(255,107,53,.12);color:var(--acc)}
.pr-plan-badge.cur-badge{background:rgba(52,211,153,.12);color:var(--green)}

.pr-plan-name{font-size:18px;font-weight:700;margin-bottom:12px}

.pr-plan-price{display:flex;align-items:baseline;gap:4px;margin-bottom:4px}
.pr-plan-amt{font-size:32px;font-weight:800;font-family:'Space Mono',monospace;letter-spacing:-1px}
.pr-plan-per{font-size:13px;color:var(--t3)}

.pr-plan-credits{font-size:13px;color:var(--acc);font-weight:600;margin-bottom:20px;font-family:'Space Mono',monospace}

.pr-plan-features{list-style:none;padding:0;margin:0 0 24px;flex:1}
.pr-plan-features li{font-size:12.5px;color:var(--t2);padding:5px 0;display:flex;align-items:flex-start;gap:8px;line-height:1.4}
.pr-plan-features li::before{content:'✓';color:var(--green);font-size:11px;font-weight:700;flex-shrink:0;margin-top:1px}

.pr-plan-btn{width:100%;padding:11px;border-radius:var(--r);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:none;transition:all .25s;display:flex;align-items:center;justify-content:center;gap:6px}
.pr-plan-btn.primary{background:var(--acc-g);color:#fff;box-shadow:0 2px 12px rgba(255,107,53,.3)}
.pr-plan-btn.primary:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(255,107,53,.4)}
.pr-plan-btn.secondary{background:var(--elev);color:var(--t2);border:1px solid var(--b2)}
.pr-plan-btn.secondary:hover{color:var(--t1);border-color:var(--b3)}
.pr-plan-btn.current-btn{background:rgba(52,211,153,.1);color:var(--green);border:1px solid rgba(52,211,153,.2);cursor:default}
.pr-plan-btn:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}

/* ── Credit packs ── */
.pr-packs{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px;max-width:1060px;margin:0 auto}
@media(max-width:600px){.pr-packs{grid-template-columns:1fr}}

.pr-pack{background:var(--card);border:1px solid var(--b1);border-radius:var(--r2);padding:28px 24px;text-align:center;cursor:pointer;transition:all .3s;position:relative}
.pr-pack:hover{border-color:var(--b3);transform:translateY(-2px);box-shadow:var(--shadow)}
.pr-pack.pop{border-color:rgba(255,107,53,.35);box-shadow:0 0 0 1px rgba(255,107,53,.15),var(--glow)}
.pr-pack.pop::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:var(--acc-g);border-radius:14px 14px 0 0}

.pr-pack-badge{display:inline-block;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.6px;padding:4px 10px;border-radius:6px;background:rgba(255,107,53,.12);color:var(--acc);margin-bottom:12px}

.pr-pack-amount{font-size:38px;font-weight:800;font-family:'Space Mono',monospace;letter-spacing:-1.5px;margin-bottom:2px}
.pr-pack-label{font-size:14px;color:var(--t2);margin-bottom:16px}

.pr-pack-price{font-size:20px;font-weight:700;margin-bottom:4px}
.pr-pack-price span{font-family:'Space Mono',monospace}
.pr-pack-unit{font-size:12px;color:var(--t3);margin-bottom:20px;font-family:'Space Mono',monospace}

.pr-pack-btn{width:100%;padding:11px;border-radius:var(--r);font-size:13px;font-weight:700;font-family:inherit;cursor:pointer;border:none;transition:all .25s}
.pr-pack-btn.primary{background:var(--acc-g);color:#fff;box-shadow:0 2px 12px rgba(255,107,53,.3)}
.pr-pack-btn.primary:hover{transform:translateY(-1px);box-shadow:0 4px 20px rgba(255,107,53,.4)}
.pr-pack-btn.secondary{background:var(--elev);color:var(--t2);border:1px solid var(--b2)}
.pr-pack-btn.secondary:hover{color:var(--t1);border-color:var(--b3)}
.pr-pack-btn:disabled{opacity:.4;cursor:not-allowed;transform:none}

/* ── Success / error toast ── */
.pr-toast{position:fixed;bottom:28px;left:50%;transform:translateX(-50%);padding:14px 28px;border-radius:var(--r);font-size:14px;font-weight:600;z-index:200;animation:toastIn .35s ease;display:flex;align-items:center;gap:10px;box-shadow:0 8px 32px rgba(0,0,0,.5)}
.pr-toast.success{background:rgba(16,185,129,.15);border:1px solid rgba(52,211,153,.3);color:var(--green)}
.pr-toast.error{background:rgba(239,68,68,.15);border:1px solid rgba(239,68,68,.3);color:var(--red)}
@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}

/* ── Processing overlay ── */
.pr-overlay{position:fixed;inset:0;background:rgba(8,9,13,.8);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);z-index:150;display:flex;align-items:center;justify-content:center}
.pr-processing{background:var(--card);border:1px solid var(--b1);border-radius:var(--r3);padding:40px 48px;text-align:center;box-shadow:var(--shadow);max-width:380px;width:90%}
.pr-spinner{width:40px;height:40px;border:3px solid var(--b2);border-top-color:var(--acc);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 20px}
@keyframes spin{to{transform:rotate(360deg)}}
.pr-proc-title{font-size:16px;font-weight:700;margin-bottom:6px}
.pr-proc-sub{font-size:13px;color:var(--t2)}

/* ── FAQ ── */
.pr-faq{max-width:680px;margin:60px auto 0;padding:0 20px}
.pr-faq-title{font-size:20px;font-weight:800;text-align:center;margin-bottom:24px;letter-spacing:-.3px}
.pr-faq-item{background:var(--card);border:1px solid var(--b1);border-radius:var(--r);margin-bottom:8px;overflow:hidden;transition:border-color .2s}
.pr-faq-item:hover{border-color:var(--b3)}
.pr-faq-q{padding:16px 20px;font-size:14px;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;user-select:none}
.pr-faq-q span{transition:transform .25s}
.pr-faq-q.open span{transform:rotate(45deg)}
.pr-faq-a{padding:0 20px 16px;font-size:13px;color:var(--t2);line-height:1.7}

/* ── Guarantee ── */
.pr-guarantee{max-width:560px;margin:48px auto 0;text-align:center;padding:28px 24px;background:var(--card);border:1px solid var(--b1);border-radius:var(--r2)}
.pr-guarantee-icon{font-size:28px;margin-bottom:8px}
.pr-guarantee-title{font-size:15px;font-weight:700;margin-bottom:6px}
.pr-guarantee-text{font-size:13px;color:var(--t2);line-height:1.6}

/* ── Animation ── */
.pr-fade{animation:prFadeIn .4s ease}
@keyframes prFadeIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
`;

// ─── Razorpay script loader ────────────────────────────────────
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-script")) {
      resolve(true);
      return;
    }
    const s = document.createElement("script");
    s.id = "razorpay-script";
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

// ─── FAQ data ──────────────────────────────────────────────────
const FAQS = [
  {
    q: "What is a credit?",
    a: "One credit generates one video. Short videos (30–60s) use 1 credit, medium videos (90s–3 min) use 2, and longer videos (5 min+) use 4 credits.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade anytime and your new credits are added immediately. When you downgrade, your current credits remain until they're used.",
  },
  {
    q: "Do unused credits roll over?",
    a: "Credits from one-time packs never expire. Subscription credits refresh each billing cycle — unused ones don't carry over.",
  },
  {
    q: "What payment methods work?",
    a: "We accept UPI, debit and credit cards, net banking, and wallets through Razorpay. All payments are processed in INR.",
  },
  {
    q: "Can I cancel my subscription?",
    a: "Cancel anytime from your account. You keep access to your current plan until the billing period ends, then you revert to the Free plan.",
  },
];

// ─── Component ─────────────────────────────────────────────────
export default function PricingPage() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("plans"); // "plans" | "packs"
  const [processing, setProcessing] = useState(false);
  const [procMsg, setProcMsg] = useState("");
  const [toast, setToast] = useState(null); // { type: "success"|"error", msg }
  const [openFaq, setOpenFaq] = useState(null);

  // ── Load user on mount ──
  useEffect(() => {
    const token = localStorage.getItem("cf_token");
    if (token) {
      api("/api/auth/me")
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => d && setUser(d))
        .catch(() => {});
    }
  }, []);

  // ── Toast auto-dismiss ──
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  // ── Show toast helper ──
  const notify = (type, msg) => setToast({ type, msg });

  // ── Reload user data after successful payment ──
  const refreshUser = async () => {
    try {
      const r = await api("/api/auth/me");
      if (r.ok) setUser(await r.json());
    } catch {}
  };

  // ──────────────────────────────────────────────────────────────
  // CREDIT PACK PURCHASE (one-time)
  // ──────────────────────────────────────────────────────────────
  const buyPack = async (packId) => {
    if (!user) {
      window.location.href = "/";
      return;
    }

    setProcessing(true);
    setProcMsg("Creating payment order…");

    try {
      // 1. Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        notify("error", "Could not load payment gateway. Please try again.");
        setProcessing(false);
        return;
      }

      // 2. Create order on backend
      const res = await api("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ pack_id: packId }),
      });
      if (!res.ok) {
        const err = await res.json();
        notify("error", err.detail || "Failed to create order");
        setProcessing(false);
        return;
      }
      const order = await res.json();

      // 3. Open Razorpay checkout
      setProcessing(false);
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "ClipForge",
        description: `${order.credits} Video Credits`,
        order_id: order.order_id,
        prefill: {
          email: order.user_email,
          name: order.user_name || "",
        },
        theme: { color: "#FF6B35" },
        handler: async function (response) {
          // 4. Verify payment
          setProcessing(true);
          setProcMsg("Verifying payment…");
          try {
            const vRes = await api("/api/payments/verify-payment", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                pack_id: packId,
              }),
            });
            const vData = await vRes.json();
            if (vRes.ok && vData.success) {
              notify(
                "success",
                `${vData.credits_added} credits added! Balance: ${vData.new_balance}`
              );
              await refreshUser();
            } else {
              notify("error", vData.detail || "Payment verification failed");
            }
          } catch {
            notify("error", "Verification failed. Contact support if charged.");
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        notify(
          "error",
          response.error?.description || "Payment failed. Please try again."
        );
      });
      rzp.open();
    } catch (e) {
      notify("error", "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  // ──────────────────────────────────────────────────────────────
  // SUBSCRIPTION
  // ──────────────────────────────────────────────────────────────
  const subscribe = async (planId) => {
    if (!user) {
      window.location.href = "/";
      return;
    }

    if (planId === "free") return;

    setProcessing(true);
    setProcMsg("Setting up subscription…");

    try {
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        notify("error", "Could not load payment gateway.");
        setProcessing(false);
        return;
      }

      const res = await api("/api/payments/create-subscription", {
        method: "POST",
        body: JSON.stringify({ plan_id: planId }),
      });
      if (!res.ok) {
        const err = await res.json();
        notify("error", err.detail || "Failed to create subscription");
        setProcessing(false);
        return;
      }
      const sub = await res.json();

      setProcessing(false);
      const options = {
        key: sub.key_id,
        subscription_id: sub.subscription_id,
        name: "ClipForge",
        description: `${sub.plan_name} Plan — Monthly`,
        theme: { color: "#FF6B35" },
        handler: async function (response) {
          setProcessing(true);
          setProcMsg("Activating your plan…");
          try {
            const vRes = await api("/api/payments/verify-subscription", {
              method: "POST",
              body: JSON.stringify({
                razorpay_subscription_id: response.razorpay_subscription_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                plan_id: planId,
              }),
            });
            const vData = await vRes.json();
            if (vRes.ok && vData.success) {
              notify(
                "success",
                `${vData.plan.charAt(0).toUpperCase() + vData.plan.slice(1)} plan activated! +${vData.credits_added} credits`
              );
              await refreshUser();
            } else {
              notify("error", vData.detail || "Subscription verification failed");
            }
          } catch {
            notify("error", "Verification failed. Contact support if charged.");
          }
          setProcessing(false);
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        notify(
          "error",
          response.error?.description || "Payment failed. Please try again."
        );
      });
      rzp.open();
    } catch {
      notify("error", "Something went wrong. Please try again.");
      setProcessing(false);
    }
  };

  // ── Format price for display ──
  const fmtPrice = (paise) => {
    if (paise === 0) return "₹0";
    return `₹${(paise).toLocaleString("en-IN")}`;
  };

  const currentPlan = user?.plan || "free";

  return (
    <div className="pr-app">
      <style>{CSS}</style>

      {/* ── Header ── */}
      <header className="pr-hdr">
        <a href="/" className="pr-logo">
          <div className="pr-logo-m">C</div>
          <div className="pr-logo-t">
            Clip<em>Forge</em>
          </div>
        </a>
        <div className="pr-hdr-r">
          {user && (
            <div className="pr-cr-badge">
              Credits: <span className="pr-cr-n">{user.credits_balance}</span>
            </div>
          )}
          <a href="/" className="pr-back-btn">
            ← {user ? "Back to app" : "Sign in"}
          </a>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="pr-hero pr-fade">
        <h1 className="pr-hero-title">
          Pick a plan, or just grab <em>credits</em>
        </h1>
        <p className="pr-hero-sub">
          Every credit generates one video. Subscribe for monthly credits at a
          discount, or buy a pack whenever you need more.
        </p>
      </div>

      {/* ── Tab toggle ── */}
      <div className="pr-tabs">
        <button
          className={`pr-tab ${tab === "plans" ? "on" : ""}`}
          onClick={() => setTab("plans")}
        >
          Monthly plans
        </button>
        <button
          className={`pr-tab ${tab === "packs" ? "on" : ""}`}
          onClick={() => setTab("packs")}
        >
          Credit packs
        </button>
      </div>

      {/* ── Content ── */}
      <div className="pr-content pr-fade" key={tab}>
        {tab === "plans" && (
          <div className="pr-plan-grid">
            {PLANS.map((plan) => {
              const isCurrent = currentPlan === plan.id;
              const isUpgrade =
                PLANS.findIndex((p) => p.id === plan.id) >
                PLANS.findIndex((p) => p.id === currentPlan);
              const isDowngrade =
                PLANS.findIndex((p) => p.id === plan.id) <
                PLANS.findIndex((p) => p.id === currentPlan);

              return (
                <div
                  key={plan.id}
                  className={`pr-plan ${plan.popular ? "pop" : ""} ${isCurrent ? "current" : ""}`}
                >
                  {plan.popular && !isCurrent && (
                    <div className="pr-plan-badge pop-badge">Most popular</div>
                  )}
                  {isCurrent && (
                    <div className="pr-plan-badge cur-badge">Current plan</div>
                  )}

                  <div className="pr-plan-name">{plan.name}</div>

                  <div className="pr-plan-price">
                    <div className="pr-plan-amt">{fmtPrice(plan.price)}</div>
                    {plan.price > 0 && (
                      <div className="pr-plan-per">/month</div>
                    )}
                  </div>
                  <div className="pr-plan-credits">
                    {plan.credits} credits{plan.price > 0 ? "/month" : ""}
                  </div>

                  <ul className="pr-plan-features">
                    {plan.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <button className="pr-plan-btn current-btn" disabled>
                      Your current plan
                    </button>
                  ) : plan.id === "free" ? (
                    <button className="pr-plan-btn secondary" disabled>
                      Free forever
                    </button>
                  ) : isDowngrade ? (
                    <button className="pr-plan-btn secondary" disabled>
                      Downgrade
                    </button>
                  ) : (
                    <button
                      className={`pr-plan-btn ${plan.popular ? "primary" : "secondary"}`}
                      onClick={() => subscribe(plan.id)}
                      disabled={processing}
                    >
                      {isUpgrade ? "Upgrade" : "Subscribe"} →
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {tab === "packs" && (
          <>
            <p
              style={{
                textAlign: "center",
                color: "var(--t2)",
                fontSize: 14,
                marginBottom: 28,
                lineHeight: 1.6,
              }}
            >
              One-time purchases. No subscription required — credits never
              expire.
            </p>
            <div className="pr-packs">
              {CREDIT_PACKS.map((pack) => {
                const perCredit = Math.round(pack.price / pack.amount);
                return (
                  <div
                    key={pack.id}
                    className={`pr-pack ${pack.popular ? "pop" : ""}`}
                  >
                    {pack.popular && (
                      <div className="pr-pack-badge">Best value</div>
                    )}
                    <div className="pr-pack-amount">{pack.amount}</div>
                    <div className="pr-pack-label">video credits</div>
                    <div className="pr-pack-price">
                      <span>{fmtPrice(pack.price)}</span>
                    </div>
                    <div className="pr-pack-unit">
                      ≈ {fmtPrice(perCredit)}/video
                    </div>
                    <button
                      className={`pr-pack-btn ${pack.popular ? "primary" : "secondary"}`}
                      onClick={() => buyPack(pack.id)}
                      disabled={processing}
                    >
                      {user ? "Buy now" : "Sign in to buy"}
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── FAQ ── */}
      <div className="pr-faq pr-fade">
        <div className="pr-faq-title">Common questions</div>
        {FAQS.map((faq, i) => (
          <div className="pr-faq-item" key={i}>
            <div
              className={`pr-faq-q ${openFaq === i ? "open" : ""}`}
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              {faq.q}
              <span>+</span>
            </div>
            {openFaq === i && <div className="pr-faq-a">{faq.a}</div>}
          </div>
        ))}
      </div>

      {/* ── Trust badge ── */}
      <div className="pr-guarantee">
        <div className="pr-guarantee-icon">🔒</div>
        <div className="pr-guarantee-title">Secure payments via Razorpay</div>
        <div className="pr-guarantee-text">
          All transactions are encrypted and processed by Razorpay.
          We never store your card details. Cancel subscriptions anytime.
        </div>
      </div>

      <div style={{ height: 80 }} />

      {/* ── Processing overlay ── */}
      {processing && (
        <div className="pr-overlay">
          <div className="pr-processing">
            <div className="pr-spinner" />
            <div className="pr-proc-title">{procMsg}</div>
            <div className="pr-proc-sub">This should only take a moment</div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && (
        <div className={`pr-toast ${toast.type}`}>
          {toast.type === "success" ? "✓" : "✕"} {toast.msg}
        </div>
      )}
    </div>
  );
}
