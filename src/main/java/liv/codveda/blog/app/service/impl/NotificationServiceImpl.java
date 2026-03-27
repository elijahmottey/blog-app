package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.entities.Notification;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.NotificationRepository;
import liv.codveda.blog.app.service.interfaces.NotificationService;
import liv.codveda.blog.app.service.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserService userService;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationServiceImpl(NotificationRepository notificationRepository,
            UserService userService,
            SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.userService = userService;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public Notification createNotification(Users user, String type, String message, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .message(message)
                .referenceId(referenceId)
                .isRead(false)
                .build();
        Notification saved = notificationRepository.save(notification);
        sendNotificationToUser(user.getId(), saved);
        return saved;
    }

    @Override
    public Page<Notification> getUserNotifications(Pageable pageable) {
        Users currentUser = getCurrentUser();
        return notificationRepository.findByUserOrderByCreatedAtDesc(currentUser, pageable);
    }

    @Override
    public Long getUnreadCount() {
        Users currentUser = getCurrentUser();
        return notificationRepository.countByUserAndIsReadFalse(currentUser);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotFoundException("Notification not found"));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        Users currentUser = getCurrentUser();
        Page<Notification> notifications = notificationRepository.findByUserOrderByCreatedAtDesc(currentUser,
                Pageable.unpaged());
        notifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    public void sendNotificationToUser(Long userId, Notification notification) {
        messagingTemplate.convertAndSend("/topic/notifications/" + userId, notification);
    }

    private Users getCurrentUser() {
        org.springframework.security.core.Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new NotFoundException("Authentication required");
        }
        if (auth.getPrincipal() instanceof Users) {
            return (Users) auth.getPrincipal();
        }
        return userService.getMyInfo(auth.getName());
    }
}
