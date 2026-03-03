package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.NotificationDto;
import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.entities.Notification;
import liv.codveda.blog.app.service.interfaces.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/notifications")
@PreAuthorize("isAuthenticated()")
public class NotificationController {

    private final NotificationService notificationService;

    @Autowired
    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Paged<NotificationDto>>> getNotifications(Pageable pageable) {
        Page<Notification> notifications = notificationService.getUserNotifications(pageable);
        Paged<NotificationDto> response = new Paged<>(
                notifications.getContent().stream()
                        .map(n -> new NotificationDto(
                                n.getId(),
                                n.getUser().getId(),
                                n.getType(),
                                n.getMessage(),
                                n.getReferenceId(),
                                n.getIsRead(),
                                n.getCreatedAt()
                        ))
                        .toList(),
                notifications.getNumber(),
                notifications.getSize(),
                notifications.getTotalElements(),
                notifications.getTotalPages(),
                notifications.isLast()
        );
        return ResponseEntity.ok(new ApiResponse<>(response, "Notifications retrieved successfully"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        Long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(new ApiResponse<>(count, "Unread count retrieved successfully"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(new ApiResponse<>(null, "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(new ApiResponse<>(null, "All notifications marked as read"));
    }
}
