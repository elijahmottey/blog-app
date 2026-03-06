import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();

  connect(userId: number, onNotification: (notification: any) => void) {
    if (this.client?.connected) return;

    // Construct WebSocket URL from API base URL
    // Assumes VITE_API_BASE_URL is like http://localhost:8088/api/v1 or http://localhost:8088
    let baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8088';
    if (baseUrl.endsWith('/api/v1')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 7);
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${baseUrl}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        this.subscribe(userId, onNotification);
        // re-subscribe to chat if needed
        this.chatCallbacks.forEach((cb, uId) => {
          this.doSubscribeChat(uId, cb);
        });
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      },
    });

    this.client.activate();
  }

  private subscribe(userId: number, onNotification: (notification: any) => void) {
    if (!this.client) return;

    this.client.subscribe(
      `/topic/notifications/${userId}`,
      (message) => {
        const notification = JSON.parse(message.body);
        onNotification(notification);
      },
      { id: `notifications-${userId}` }
    );
  }

  // Subscribe to chat messages
  subscribeToChat(userId: number, onMessage: (message: any) => void) {
    if (!this.client?.connected) {
      // If not connected yet, wait or connection will handle it.
      // Usually, the app calls connect() early.
      // If it's already connected, we just subscribe.
      console.warn("WebSocket not connected yet, could not subscribe to chat immediately.");
      // In a robust implementation, queue this. For now, we assume it's connected.
    }

    // Subscribe if connected
    if (this.client?.connected) {
      this.doSubscribeChat(userId, onMessage);
    }
    // Alternatively, we store the callback and call it onConnect
    this.chatCallbacks.set(userId, onMessage);
  }

  private chatCallbacks = new Map<number, (msg: any) => void>();

  private doSubscribeChat(userId: number, onMessage: (message: any) => void) {
    this.client?.subscribe(
      `/topic/messages/${userId}`,
      (message) => {
        const chatMsg = JSON.parse(message.body);
        onMessage(chatMsg);
      },
      { id: `chat-${userId}` }
    );
  }

  unsubscribeFromChat(userId: number) {
    this.client?.unsubscribe(`chat-${userId}`);
    this.chatCallbacks.delete(userId);
  }

  sendChatMessage(message: { recipientId: number; content: string; postId?: number }) {
    if (this.client?.connected) {
      this.client.publish({
        destination: '/app/chat',
        body: JSON.stringify(message),
      });
    }
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
  }
}

export const webSocketService = new WebSocketService();
