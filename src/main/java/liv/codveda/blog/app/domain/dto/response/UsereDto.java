package liv.codveda.blog.app.domain.dto.response;

import liv.codveda.blog.app.domain.dto.reference.CommentReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.PostReferenceDto;
import liv.codveda.blog.app.domain.enums.Roles;

import java.time.LocalDateTime;
import java.util.List;

public record UsereDto(
        Long id,
        String name,
        String email,
        Roles role,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<PostReferenceDto> posts,
        List<CommentReferenceDto> comments

) {
}
