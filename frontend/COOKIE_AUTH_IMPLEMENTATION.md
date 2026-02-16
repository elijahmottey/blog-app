# Frontend Cookie-Based Authentication Implementation

## Changes Made

### 1. BackendApi.ts - Complete Refactor

#### Added CSRF Token Management
```typescript
static getCsrfToken(): string | null
static async fetchCsrfToken()
```
- Reads CSRF token from `XSRF-TOKEN` cookie
- Fetches CSRF token from `/api/v1/csrf` endpoint on app load

#### Updated Token Management
- Removed localStorage token storage (tokens now in HttpOnly cookies)
- Kept role storage in localStorage for authorization checks
- Simplified token validation (backend validates cookies)

#### Updated Axios Configuration
- Added `withCredentials: true` to send cookies with requests
- Request interceptor adds `X-XSRF-TOKEN` header to non-GET requests
- Response interceptor simplified (no Authorization header management)

#### Updated Authentication Methods
- `registerUser()` - No longer stores tokens, only role
- `loginUser()` - No longer stores tokens, only role
- `registerAdmin()` - No longer stores tokens, only role
- `logoutUser()` - Backend clears cookies
- `refreshAccessToken()` - Backend handles via cookies

#### Updated Authentication Check
- `isAuthenticated()` - Now checks if roles exist instead of token validity

### 2. OAuth2RedirectHandler.tsx - Simplified

**Before:**
- Extracted tokens from URL parameters
- Stored tokens in localStorage
- Set expiration dates

**After:**
- Tokens automatically in cookies from backend
- Simply redirects to dashboard
- No token management needed

### 3. App.tsx - CSRF Initialization

**Added:**
- Fetches CSRF token on app load via `BackendApi.fetchCsrfToken()`

**Removed:**
- Token expiration checking (backend handles via cookies)

## How It Works

### Authentication Flow

1. **Login/Register:**
   - User submits credentials
   - Backend validates and sets JWT tokens in HttpOnly cookies
   - Backend returns user info and role
   - Frontend stores role in localStorage
   - User redirected to dashboard

2. **OAuth2 Flow:**
   - User clicks OAuth2 provider button
   - Backend handles OAuth2 flow
   - Backend sets JWT tokens in HttpOnly cookies
   - Backend redirects to `/oauth2/redirect`
   - Frontend redirects to dashboard

3. **Authenticated Requests:**
   - Cookies automatically sent with every request
   - CSRF token added to non-GET request headers
   - Backend validates both JWT cookie and CSRF token

4. **Logout:**
   - Frontend calls `/api/v1/auth/logout`
   - Backend clears JWT cookies
   - Frontend clears role from localStorage
   - User redirected to login

### CSRF Protection

1. **On App Load:**
   - App fetches CSRF token from `/api/v1/csrf`
   - Token stored in `XSRF-TOKEN` cookie by backend

2. **On Each Request:**
   - Axios interceptor reads token from cookie
   - Adds `X-XSRF-TOKEN` header to non-GET requests
   - Backend validates token matches cookie

### Cookie Configuration

**Development (localhost):**
```yaml
cookie:
  domain: localhost
  secure: false
```

**Production:**
```yaml
cookie:
  domain: yourdomain.com
  secure: true  # HTTPS only
```

## Security Benefits

1. **XSS Protection:** HttpOnly cookies prevent JavaScript access to tokens
2. **CSRF Protection:** Double-submit cookie pattern validates requests
3. **Secure Transport:** Cookies only sent over HTTPS in production
4. **No Token Exposure:** Tokens never in localStorage or URL
5. **Automatic Expiration:** Cookies expire server-side

## Migration Notes

### What Changed
- ✅ Tokens moved from localStorage to HttpOnly cookies
- ✅ CSRF protection enabled
- ✅ OAuth2 tokens no longer in URL
- ✅ Simplified token management
- ✅ Backend validates all requests

### What Stayed the Same
- ✅ Role-based authorization still works
- ✅ API method signatures unchanged
- ✅ Component code unchanged
- ✅ Routing logic unchanged

### Breaking Changes
- ❌ Cannot access tokens via JavaScript (by design)
- ❌ Cannot manually set Authorization header (not needed)
- ❌ Must use `credentials: 'include'` in fetch requests

## Testing Checklist

- [ ] Login with email/password
- [ ] Register new user
- [ ] Login with Google OAuth2
- [ ] Login with GitHub OAuth2
- [ ] Create/edit/delete posts (authenticated)
- [ ] Logout
- [ ] Access protected routes
- [ ] Token refresh on 401
- [ ] CSRF token in non-GET requests
- [ ] Cookies set after login
- [ ] Cookies cleared after logout

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ⚠️ Requires third-party cookies enabled
- ⚠️ SameSite=Lax may block cross-site requests

## Production Deployment

1. Set `cookie.secure: true` in application.yaml
2. Enable HTTPS on backend
3. Update CORS allowed origins
4. Set proper `cookie.domain`
5. Test OAuth2 redirect URIs
6. Verify CSRF token flow
7. Test logout clears cookies
