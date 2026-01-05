package liv.codveda.blog.app.domain.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record ApiResponse<T>(
        T data,
        String message,
        LocalDateTime timestamp,
        String requestId

) {
    public ApiResponse(T data, String message) {
        this(data,message,LocalDateTime.now(), UUID.randomUUID().toString());
    }
}
