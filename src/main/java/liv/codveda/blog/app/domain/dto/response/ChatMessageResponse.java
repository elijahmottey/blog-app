package liv.codveda.blog.app.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    private Long id;
    private Long senderId;
    private Long recipientId;
    private String content;
    private Long postId;
    private LocalDateTime timestamp;
}
