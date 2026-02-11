package liv.codveda.blog.app.domain.dto.reference;

import java.util.Locale;
import liv.codveda.blog.app.domain.enums.Category;

public record PostReferenceDto(
        Long id,
        String title,
        Category category,
        String content
) {
}
