package liv.codveda.blog.app.domain.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class HighlightDto {
    private Long id;
    private Long postId;
    private String selectedText;
    private String note;
    private int startOffset;
    private int endOffset;
    private String color;
    private LocalDateTime createdAt;
}