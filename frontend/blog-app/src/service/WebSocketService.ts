import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export class WebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, any> = new Map();

  connect(userId: number, onNotification: (notification: any) => void) {
    if (this.client?.connected) return;

    this.client = new Client({
      webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('WebSocket connected');
        this.subscribe(userId, onNotification);
      },
      onStompError: (frame) => {
        console.error('WebSocket error:', frame);
      },
    });

    this.client.activate();
  }

  private subscribe(userId: number, onNotification: (notification: any) => void) {
    if (!this.client) return;

    const subscription = this.client.subscribe(
      `/topic/notifications/${userId}`,
      (message) => {
        const notification = JSON.parse(message.body);
        onNotification(notification);
      }
    );

    this.subscriptions.set(`notifications-${userId}`, subscription);
  }

  disconnect() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.clear();
    this.client?.deactivate();
    this.client = null;
  }
}

export const webSocketService = new WebSocketService();
