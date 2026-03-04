package liv.codveda.blog.app.domain.dto.response;

import java.time.LocalDateTime;

public record PostReportDto(
        Long id,
        Long postId,
        String postTitle,
        Long reporterId,
        String reporterName,
        String reason,
        LocalDateTime createdAt
) {}
