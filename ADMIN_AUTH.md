# Admin Authentication Setup

Admin dashboard को अब secret रख दिया गया है। Admin बिना login के dashboard access नहीं कर सकते।

## Frontend Setup

Frontend में `/admin-login` page है जहाँ admin अपने credentials डाल सकते हैं।

```
URL: http://localhost:5173/admin-login
```

Admin login करने के बाद token localStorage में store हो जाता है और protected `/admin` route accessible हो जाता है।

Logout के लिए navbar में "Logout" button है।

## Backend Setup

### Admin Credentials

Backend को `.env` में admin credentials दिए हैं:

```
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

Production में अपने credentials set करें।

### Authentication Flow

1. Frontend से `/api/admin/login` को username + password भेजते हैं।
2. Backend credentials validate करता है।
3. Valid होने पर token generate करके भेजता है।
4. Frontend token localStorage में store करता है।
5. सभी protected API calls में `Authorization: Bearer <token>` header में token भेजते हैं।
6. Backend token verify करके request handle करता है।

### Protected Endpoints

- `POST /api/courses/admin` - Course create करना (auth required)
- `POST /api/admin/logout` - Logout (auth required)

### Login API

```
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "admin_token_1715XXX_xxxxx"
}
```

## Frontend Auth Context

`useAdminAuth()` hook use करके auth state access कर सकते हैं:

```javascript
const { adminToken, isInitialized, login, logout } = useAdminAuth();
```

Protected routes के लिए `ProtectedAdminRoute` component use होता है। Bina token के `/admin` route automatically `/admin-login` पर redirect कर देता है।

## Important Notes

- Admin tokens in-memory store हैं (server restart पर clear हो जाएंगे)
- Production में persistent session storage setup करें
- Token expiry mechanism भी add करें
- HTTPS पर admin routes expose करें
