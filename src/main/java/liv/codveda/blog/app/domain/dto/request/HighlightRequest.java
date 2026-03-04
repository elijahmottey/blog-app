package liv.codveda.blog.app.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class HighlightRequest {
    @NotBlank
    private String selectedText;
    
    private String note;
    
    @NotNull
    private Integer startOffset;
    
    @NotNull
    private Integer endOffset;
    
    private String color;
}