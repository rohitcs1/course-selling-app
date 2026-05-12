# Production Deployment Guide

## Overview
This guide covers deploying the CourseNest application to production with proper Razorpay payment integration.

## Frontend Configuration (Vercel/Production Host)

### Environment Variables (.env)
```
VITE_API_BASE_URL=https://api.rasoiroom.in
VITE_ADMIN_API_KEY=your-actual-admin-api-key
```

✅ **Already Set Correctly** in `frontend/.env`

## Backend Configuration (Production Server)

### Environment Variables (.env)
```bash
# Server Configuration
PORT=4000
NODE_ENV=production
FRONTEND_ORIGIN=https://rasoiroom.in
FRONTEND_ORIGINS=https://rasoiroom.in,https://www.rasoiroom.in

# Database (Supabase)
SUPABASE_URL=https://mlbpoupzpekgxdvtaodm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Razorpay (PRODUCTION KEYS - Replace with Live Keys)
RAZORPAY_KEY_ID=rzp_live_XXX...  # ⚠️ Use LIVE key in production
RAZORPAY_KEY_SECRET=xxxxx...      # ⚠️ Use LIVE key secret in production
RAZORPAY_WEBHOOK_SECRET=xxxxx...  # ⚠️ Get from Razorpay Dashboard

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=rasoiroom31@gmail.com
SMTP_PASS=rutkoyvqzwsebboz
EMAIL_FROM="CourseNest <rasoiroom31@gmail.com>"

# Admin API
ADMIN_API_KEY=your-secure-admin-key
```

### ⚠️ CRITICAL FOR PRODUCTION
1. **Replace Razorpay TEST keys with LIVE keys** before deploying
   - Go to https://dashboard.razorpay.com
   - Navigate to Settings → API Keys
   - Copy the LIVE Key ID and Key Secret
   - Update in production .env

2. **Set NODE_ENV=production** to enable proper CORS with production domains

3. **Update RAZORPAY_WEBHOOK_SECRET** from Razorpay Dashboard
   - Settings → Webhooks → Copy Secret

## Razorpay Payment Flow Verification

### 1. Client-Side Payment (CheckoutPage.jsx)
```
User fills form with: name, email, phone
         ↓
Creates Razorpay order: POST /api/payments/create-order
         ↓
Returns: keyId, orderId, amount (in paise)
         ↓
Razorpay modal opens with:
  - key: ${RAZORPAY_KEY_ID}
  - amount: 19900 (₹199 in paise)
  - order_id: order_Xxxxx
         ↓
User completes payment
         ↓
Razorpay returns: razorpay_order_id, razorpay_payment_id, razorpay_signature
         ↓
Frontend verifies: POST /api/payments/verify
         ↓
Backend validates signature using HMAC-SHA256
         ↓
✅ Redirect to /success page
```

### 2. Server-Side Payment (Webhook)
```
Payment completed on Razorpay
         ↓
Razorpay sends: payment.captured webhook
         ↓
Backend verifies webhook signature
         ↓
Creates enrollment
         ↓
Sends welcome email with drive link
         ↓
email_logs table updated
```

## Debugging Checklist

### Frontend Console Errors (Browser Dev Tools)
```
❌ ERR_CONNECTION_REFUSED to localhost
→ Fix: Ensure VITE_API_BASE_URL=https://api.rasoiroom.in in .env

❌ CORS error
→ Fix: Ensure backend FRONTEND_ORIGINS includes https://rasoiroom.in

❌ "Payment signature verification failed"
→ Fix: Verify Razorpay Key Secret is correct in backend .env

❌ 500 Internal Server Error on /api/payments/verify
→ Check backend logs for error details
→ Ensure env.razorpayKeySecret is present
```

### Backend Logs (Server Terminal)
Look for these log messages when payment is processed:

```bash
# Order Creation
POST /api/payments/create-order
✅ Order created successfully

# Payment Verification
🎉 Payment response received from Razorpay
🔍 Verifying payment with backend
Verifying body: order_Xxxxx|pay_Xxxxx
✅ Payment signature verified successfully for orderId: order_Xxxxx

# Webhook Processing
Webhook event received: payment.captured
✅ Order marked as paid
✅ Enrollment created
✅ Welcome email sent successfully
```

## Testing in Production

### Test Payment Flow
1. Go to https://rasoiroom.in/checkout/ig-growth-blueprint
2. Fill form:
   - Name: Test User
   - Email: your-email@example.com
   - Phone: 9876543210
3. Click "Pay ₹2,999"
4. Complete payment with Razorpay test card (if using test keys):
   - Card: 4111 1111 1111 1111
   - Date: Any future date (MM/YY)
   - CVV: 123
5. Should redirect to /success page
6. Check email for welcome message with Google Drive link
7. Check browser console for logs (no localhost errors)

### Verify in Database
```sql
-- Check order was created
SELECT * FROM orders WHERE razorpay_order_id = 'order_Xxxxx';

-- Check enrollment was created
SELECT * FROM enrollments WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');

-- Check email was logged
SELECT * FROM email_logs WHERE user_id = (SELECT id FROM users WHERE email = 'your-email@example.com');
```

## Deployment Steps

1. **Backend** - Deploy to production server (VPS/Cloud)
   ```bash
   npm install
   npm run build (if applicable)
   npm start
   # Or use PM2 for process management
   pm2 start src/server.js --name "coursanest-backend"
   ```

2. **Frontend** - Deploy to Vercel
   ```bash
   # Vercel auto-deploys from git
   # Ensure .env variables are set in Vercel dashboard
   ```

3. **Razorpay Webhook** - Configure webhook URL
   - Go to https://dashboard.razorpay.com
   - Settings → Webhooks → Add New Webhook
   - URL: https://api.rasoiroom.in/api/payments/webhook
   - Events: payment.captured, payment.failed

4. **HTTPS Certificate**
   - Ensure both frontend and backend run on HTTPS
   - Use Let's Encrypt / SSL certificate provider

## Monitoring

### Key Metrics to Monitor
- /api/payments/verify response time
- Payment success rate
- Email delivery success rate
- Database connection pool status
- Error logs for payment verification failures

### Logs to Review Daily
- Backend error logs (payment verification failures)
- Email_logs table for failed email deliveries
- Razorpay dashboard for payment disputes

## Troubleshooting

### Payment verification fails with signature mismatch
1. Verify RAZORPAY_KEY_SECRET is correct (copy exact value from dashboard)
2. Check that frontend is sending correct Razorpay response
3. Verify no whitespace in env variables

### Emails not sending
1. Check SMTP credentials are correct
2. Verify Gmail account allows "Less secure apps"
3. Check email_logs table for error messages
4. Verify EMAIL_FROM format is correct

### Orders not appearing in database
1. Check Supabase connection (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
2. Verify database schema is up to date (run schema.sql)
3. Check backend logs for database errors

## Production Security Checklist
- [ ] NODE_ENV=production is set
- [ ] All localhost references removed
- [ ] Razorpay LIVE keys in use (not test keys)
- [ ] HTTPS enforced for both frontend and backend
- [ ] CORS properly configured for production domains
- [ ] Webhook secret configured in Razorpay dashboard
- [ ] Admin API key changed from default
- [ ] Database credentials are secure
- [ ] SMTP password is not exposed in logs
- [ ] Error messages don't leak sensitive information
