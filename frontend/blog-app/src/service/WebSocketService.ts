import { Client, Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

// Define message types
export interface ChatMessage {
  id: number;
  senderId: number;
  recipientId: number;
  content: string;
  postId?: number;
  timestamp: string;
  isRead?: boolean;
}

export interface Notification {
  id: number;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// WebSocket service to handle connection and subscriptions
class WebSocketService {
  private client: Client | null = null;
  private chatCallbacks = new Map<number, (msg: any) => void>();
  private notificationCallbacks = new Map<number, (notification: any) => void>();
  private userId: number | null = null;

  // Initialize connection
  connect(userId: number, onNotification?: (notification: any) => void) {
    if (this.client && this.client.connected) {
      // Already connected, just update subscriptions if needed
      if (this.userId !== userId) {
        this.disconnect();
      } else {
        if (onNotification) {
          this.notificationCallbacks.set(userId, onNotification);
        }
        return;
      }
    }

    this.userId = userId;
    if (onNotification) {
      this.notificationCallbacks.set(userId, onNotification);
    }

    const token = Cookies.get('accessToken');

    // Base URL configuration
    let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';
    // Remove /api/v1 if present to get root URL
    if (baseUrl.endsWith('/api/v1')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 7);
    }
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    const socketUrl = `${baseUrl}/ws`;

    this.client = new Client({
      webSocketFactory: () => new SockJS(socketUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => {
        // console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket Connected');
        this.subscribeToTopics();
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketClose: () => {
        console.log('WebSocket connection closed');
      }
    });

    this.client.activate();
  }

  private subscribeToTopics() {
    if (!this.client || !this.client.connected || !this.userId) return;

    // Subscribe to Notifications
    this.client.subscribe(`/topic/notifications/${this.userId}`, (message) => {
      try {
        const notification = JSON.parse(message.body);
        const callback = this.notificationCallbacks.get(this.userId!);
        if (callback) callback(notification);
      } catch (e) {
        console.error('Error parsing notification', e);
      }
    });

    // Subscribe to Chat Messages
    this.client.subscribe(`/topic/messages/${this.userId}`, (message) => {
      try {
        const chatMsg = JSON.parse(message.body);
        const callback = this.chatCallbacks.get(this.userId!);
        if (callback) callback(chatMsg);
      } catch (e) {
        console.error('Error parsing chat message', e);
      }
    });
  }

  subscribeToChat(userId: number, onMessage: (message: any) => void) {
    this.chatCallbacks.set(userId, onMessage);
    // If we're already connected, the subscription is handled in subscribeToTopics
    // But we need to make sure we're connected with the correct userId
    if (!this.client?.connected) {
      this.connect(userId);
    }
  }

  unsubscribeFromChat(userId: number) {
    this.chatCallbacks.delete(userId);
  }

  sendChatMessage(message: { recipientId: number; content: string; postId?: number }) {
    if (this.client?.connected) {
      this.client.publish({
        destination: '/app/chat', // Make sure this matches backend @MessageMapping
        body: JSON.stringify(message),
      });
    } else {
      console.warn('Cannot send message: WebSocket not connected');
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
      this.userId = null;
      this.chatCallbacks.clear();
      this.notificationCallbacks.clear();
    }
  }
}

export const webSocketService = new WebSocketService();
