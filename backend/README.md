# Course App Backend

Node.js + Express backend for course selling app with Supabase database, Razorpay payments, and automated welcome email after successful payment.

## 1) Setup

1. Copy `.env.example` to `.env`.
2. Fill Supabase, Razorpay, SMTP, and admin values.
3. Run SQL in `sql/schema.sql` inside Supabase SQL editor.
4. Install dependencies and start server.

```bash
cd backend
npm install
npm run dev
```

Default server URL: `http://localhost:4000`

## 2) Razorpay Webhook Setup

In Razorpay dashboard:

1. Go to Webhooks.
2. Add endpoint: `https://your-domain.com/api/payments/webhook`
3. Add events:
	 - `payment.captured`
	 - `payment.failed`
4. Set webhook secret.
5. Put the same secret in `.env` as `RAZORPAY_WEBHOOK_SECRET`.

For local testing, use a public tunnel (for example ngrok) and use that URL as webhook endpoint.

## 3) Database Files

1. `sql/schema.sql`: tables + indexes + seed courses.
2. `sql/queries.sql`: reporting and admin useful queries.

## 4) API Endpoints

### Health

- `GET /health`

### Courses

- `GET /api/courses`
- `GET /api/courses/:courseId`
- `POST /api/courses/admin` (requires header `x-admin-key`)

Example admin create course payload:

```json
{
	"title": "Instagram Ads Masterclass",
	"heading": "Scale your sales with paid ads",
	"description": "From ad click to enrollment.",
	"price": 2999,
	"thumbnailUrl": "https://...",
	"duration": "6 Weeks",
	"level": "Beginner to Intermediate",
	"driveLink": "https://drive.google.com/...",
	"isPublished": true
}
```

### Payments

- `POST /api/payments/create-order`
- `POST /api/payments/webhook`

Create-order payload:

```json
{
	"courseId": "ig-growth-blueprint",
	"name": "Kartik",
	"email": "kartik@example.com",
	"phone": "9999999999"
}
```

Response includes `keyId`, `orderId`, and `amount` for Razorpay checkout in frontend.

### User Panel

- `GET /api/user/enrollments?email=kartik@example.com`

## 5) Post-Payment Automation

On `payment.captured` webhook:

1. Order status becomes `paid`.
2. Enrollment record is created.
3. Welcome + course access email is sent.
4. Email status is stored in `email_logs`.
