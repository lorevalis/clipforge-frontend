# ClipDunk Pricing Page — Setup Guide

You need to do 3 small things. Total time: about 2 minutes.

---

## Step 1: Create the pricing folder and add the files

Inside your frontend project, create this folder structure:

```
ClipDunk-frontend/
  src/
    app/
      page.js              ← (already exists — your main app)
      ClipDunk-premium.jsx ← (already exists — your main app component)
      pricing/              ← CREATE THIS FOLDER
        page.js             ← PUT the "page.js" file here
        pricing.jsx         ← PUT the "pricing.jsx" file here
```

**How to do it:**
1. Open your `ClipDunk-frontend` folder in VS Code
2. In the left sidebar, right-click on the `src/app` folder
3. Click "New Folder" → type `pricing` → press Enter
4. Download the two files I gave you (`pricing.jsx` and `page.js`)
5. Drag both files into the `pricing` folder

---

## Step 2: Add a "Pricing" button to your main app header

Open `src/app/ClipDunk-premium.jsx` and find this line (around line 211-214):

```jsx
<div className="hdr-r">
  {user && <span className="plan-badge">{user.plan}</span>}
  <div className="cr-badge">Credits: <span className="cr-n">{user?.credits_balance ?? 0}</span></div>
  <button className="lo-btn" onClick={logout}>Log out</button>
</div>
```

Change it to (add the highlighted line):

```jsx
<div className="hdr-r">
  {user && <span className="plan-badge">{user.plan}</span>}
  <div className="cr-badge">Credits: <span className="cr-n">{user?.credits_balance ?? 0}</span></div>
  <a href="/pricing" className="lo-btn" style={{textDecoration:"none",color:"inherit"}}>Pricing</a>
  <button className="lo-btn" onClick={logout}>Log out</button>
</div>
```

Save the file.

---

## Step 3: Test it

1. Make sure your backend is running (`docker compose up` in the ClipDunk folder)
2. Make sure your frontend is running (`npm run dev` in the ClipDunk-frontend folder)
3. Open your browser and go to: **http://localhost:3000/pricing**

You should see the pricing page with your plans and credit packs!

---

## How the payment flow works

When a user clicks "Subscribe" or "Buy now":

```
1. Your frontend calls YOUR backend → /api/payments/create-order
2. Your backend calls Razorpay → creates a payment order
3. Razorpay checkout popup opens → user pays
4. After payment, frontend calls → /api/payments/verify-payment
5. Backend verifies the signature → adds credits to user
6. User sees updated credit balance
```

All of this is already built. The backend handles everything.

---

## Before going live

When you're ready for real payments:

1. Log into **Razorpay Dashboard** (https://dashboard.razorpay.com)
2. Switch from Test Mode to Live Mode
3. Complete KYC verification
4. Generate new Live API keys
5. Update your `.env` file with the live keys:
   - `RAZORPAY_KEY_ID=rzp_live_...`
   - `RAZORPAY_KEY_SECRET=...`
6. Create subscription plans in Razorpay Dashboard:
   - Go to "Subscriptions" → "Plans" → "Create Plan"
   - Create Starter (₹749/month), Creator (₹1599/month), Pro (₹4099/month), Business (₹8299/month)
   - Copy each Plan ID and paste into your `.env`:
     - `RAZORPAY_PLAN_STARTER=plan_...`
     - `RAZORPAY_PLAN_CREATOR=plan_...`
     - `RAZORPAY_PLAN_PRO=plan_...`
     - `RAZORPAY_PLAN_BUSINESS=plan_...`
7. Set up webhook in Razorpay:
   - Go to "Settings" → "Webhooks" → "Add New Webhook"
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: subscription.charged, subscription.cancelled, payment.failed
   - Copy the webhook secret into `RAZORPAY_WEBHOOK_SECRET=...`
8. Restart your backend (`docker compose down` then `docker compose up`)

---

## Testing payments (before going live)

Razorpay test mode accepts these fake payment methods:
- **Card:** 4111 1111 1111 1111 (any future expiry, any CVV)
- **UPI:** success@razorpay (for successful test payments)
- **Net Banking:** any bank, any credentials

No real money is charged in test mode.
