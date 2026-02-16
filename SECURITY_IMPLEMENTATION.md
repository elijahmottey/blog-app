# Secure Cookie-Based JWT Authentication with CSRF Protection

## Overview
Implemented secure cookie-based JWT authentication with CSRF protection for the blog application.

## Backend Changes

### 1. Cookie Management (CookieUtils.java)
- Created utility class for managing HttpOnly, Secure cookies
- Supports cookie creation, retrieval, and deletion
- Configurable domain and secure flag via application.yaml

### 2. Security Configuration Updates

#### SecurityConfig.java
- Enabled CSRF protection with CookieCsrfTokenRepository
- CSRF tokens stored in cookies (not HttpOnly to allow JavaScript access)
- CSRF protection bypassed for: /api/v1/auth/login, /api/v1/auth/signup, /oauth2/**, /login/oauth2/**
- Added /api/v1/csrf endpoint to permitAll for token retrieval

#### JWTAuthFilter.java
- Updated to read JWT tokens from cookies first
- Falls back to Authorization header if cookie not present
- Supports both cookie-based and header-based authentication

### 3. Authentication Flow Updates

#### AuthenticationServiceImpl.java
- All authentication methods now set JWT tokens in HttpOnly cookies
- Access token: 1 hour expiration
- Refresh token: 7 days expiration
- Tokens still returned in response body for backward compatibility

#### AuthenticationController.java
- Updated all endpoints to accept HttpServletResponse
- Logout endpoint now clears both accessToken and refreshToken cookies

#### OAuth2AuthenticationSuccessHandler.java
- OAuth2 flow now sets tokens in cookies instead of URL parameters
- Redirects to /oauth2/redirect without token parameters
- More secure - tokens not exposed in URL

### 4. CSRF Protection

#### CsrfController.java
- New endpoint: GET /api/v1/csrf
- Returns CSRF token for frontend to include in requests
- Token automatically set in XSRF-TOKEN cookie by Spring Security

#### CorsConfig.java
- Added Set-Cookie to exposed headers
- Maintains allowCredentials: true for cookie support

### 5. Configuration (application.yaml)
```yaml
cookie:
  domain: localhost
  secure: false  # Set to true in production with HTTPS
```

## Frontend Integration Required

### 1. Fetch CSRF Token on App Load
```typescript
const fetchCsrfToken = async () => {
  const response = await fetch('http://localhost:8088/api/v1/csrf', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.token;
};
```

### 2. Include CSRF Token in Requests
```typescript
const csrfToken = getCsrfTokenFromCookie(); // Read from XSRF-TOKEN cookie

fetch('http://localhost:8088/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-XSRF-TOKEN': csrfToken
  },
  credentials: 'include',
  body: JSON.stringify(loginData)
});
```

### 3. Update API Service
- Add `credentials: 'include'` to all fetch requests
- Remove manual token management from localStorage
- Read CSRF token from XSRF-TOKEN cookie
- Include X-XSRF-TOKEN header in all non-GET requests

### 4. Update OAuth2RedirectHandler
- Remove token extraction from URL parameters
- Tokens are now in cookies automatically
- Simply redirect to dashboard after OAuth2 callback

### 5. Logout Implementation
```typescript
const logout = async () => {
  const csrfToken = getCsrfTokenFromCookie();
  
  await fetch('http://localhost:8088/api/v1/auth/logout', {
    method: 'POST',
    headers: {
      'X-XSRF-TOKEN': csrfToken
    },
    credentials: 'include'
  });
  
  // Redirect to login
  window.location.href = '/login';
};
```

## Security Benefits

1. **HttpOnly Cookies**: JWT tokens not accessible via JavaScript, preventing XSS attacks
2. **Secure Flag**: Cookies only sent over HTTPS in production
3. **CSRF Protection**: Double-submit cookie pattern protects against CSRF attacks
4. **SameSite**: Cookies can be configured with SameSite attribute
5. **No Token Exposure**: OAuth2 tokens not exposed in URL parameters

## Production Checklist

- [ ] Set `cookie.secure: true` in production
- [ ] Configure proper `cookie.domain` for your domain
- [ ] Enable HTTPS
- [ ] Update CORS allowed origins to production frontend URL
- [ ] Set SameSite=Strict or Lax on cookies
- [ ] Review CSRF ignored endpoints

## Backward Compatibility

- JWT tokens still returned in response body
- Authorization header authentication still supported
- Existing clients can continue using header-based auth
- New clients should use cookie-based auth
