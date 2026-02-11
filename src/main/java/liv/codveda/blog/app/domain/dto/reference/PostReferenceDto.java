package liv.codveda.blog.app.domain.dto.reference;

public record PostReferenceDto(
        Long id,
        String title,
        String category,
        String content
) {
}
