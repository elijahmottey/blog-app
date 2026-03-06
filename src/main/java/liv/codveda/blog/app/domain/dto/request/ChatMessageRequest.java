package liv.codveda.blog.app.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotBlank(message = "Message content is required")
    private String content;

    private Long postId; // Optional reference
}
