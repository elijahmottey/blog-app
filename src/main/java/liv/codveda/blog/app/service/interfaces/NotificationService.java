package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.entities.Notification;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Notification createNotification(Users user, String type, String message, Long referenceId);
    Page<Notification> getUserNotifications(Pageable pageable);
    Long getUnreadCount();
    void markAsRead(Long notificationId);
    void markAllAsRead();
    void sendNotificationToUser(Long userId, Notification notification);
}
