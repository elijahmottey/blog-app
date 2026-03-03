# WebSocket Notification System

## Overview
Real-time notification system using WebSocket (STOMP over SockJS) for instant delivery of notifications.

## Backend Changes

### 1. WebSocket Configuration
**File:** `src/main/java/liv/codveda/blog/app/config/WebSocketConfig.java`
- Enables WebSocket message broker
- Endpoint: `/ws` with SockJS fallback
- Topic prefix: `/topic`

### 2. Updated NotificationService
**Files:**
- Interface: Added `sendNotificationToUser` method
- Implementation: Integrated `SimpMessagingTemplate` to send real-time notifications

**WebSocket Topic:** `/topic/notifications/{userId}`

### 3. Updated SecurityConfig
- Added `/ws/**` to permitted endpoints for WebSocket connections

### 4. Updated build.gradle
- Added `spring-boot-starter-websocket` dependency

## Frontend Changes

### 1. WebSocket Service
**File:** `frontend/blog-app/src/service/WebSocketService.ts`
- Manages WebSocket connection using STOMP client
- Auto-reconnect on disconnect
- Subscribes to user-specific notification topic

### 2. Updated useNotificationSystem Hook
**File:** `frontend/blog-app/src/hooks/useNotificationSystem.ts`
- Connects to WebSocket on mount
- Receives real-time notifications
- Shows toast notification on new message
- Auto-updates notification list and count
- Removed polling (refetchInterval)

### 3. Updated NotificationPanel
**File:** `frontend/blog-app/src/components/dashboard/NotificationPanel.tsx`
- Passes userId to hook for WebSocket connection

### 4. New Dependencies
- `sockjs-client` - SockJS client for WebSocket fallback
- `@stomp/stompjs` - STOMP protocol over WebSocket

## How It Works

1. **User Login:** Frontend connects to WebSocket with userId
2. **Notification Created:** Backend saves notification to database
3. **Real-time Push:** Backend sends notification via WebSocket to `/topic/notifications/{userId}`
4. **Frontend Receives:** WebSocket client receives notification instantly
5. **UI Update:** Toast notification appears, badge updates, list refreshes

## WebSocket Flow

```
Backend                          Frontend
   |                                |
   |  1. User creates comment       |
   |<-------------------------------|
   |                                |
   |  2. Save to database           |
   |                                |
   |  3. Send via WebSocket         |
   |------------------------------->|
   |  /topic/notifications/123      |
   |                                |
   |                                |  4. Show toast
   |                                |  5. Update badge
   |                                |  6. Refresh list
```

## Testing

1. Open two browser windows
2. Login as User A in window 1
3. Login as User B in window 2
4. User B comments on User A's post
5. User A receives instant notification (no page refresh needed)

## Advantages Over Polling

- **Instant delivery** - No 30-second delay
- **Reduced server load** - No repeated API calls
- **Better UX** - Real-time updates
- **Scalable** - WebSocket is more efficient

## Configuration

**Backend WebSocket URL:** `http://localhost:8080/ws`
**Frontend connects via:** `VITE_API_BASE_URL/ws`

## Dependencies Added

### Backend (build.gradle)
```gradle
implementation 'org.springframework.boot:spring-boot-starter-websocket'
```

### Frontend (package.json)
```json
"sockjs-client": "^1.6.1",
"@stomp/stompjs": "^7.0.0"
```
