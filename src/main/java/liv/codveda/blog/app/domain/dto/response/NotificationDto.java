package liv.codveda.blog.app.domain.dto.response;

import java.time.LocalDateTime;

public record NotificationDto(
        Long id,
        Long userId,
        String type,
        String message,
        Long referenceId,
        Boolean isRead,
        LocalDateTime createdAt
) {}
