package liv.codveda.blog.app.domain.dto.response;

import liv.codveda.blog.app.domain.dto.reference.PostReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.UsersReferenceDto;

import java.time.LocalDateTime;

public record CommentDto(
        Long id,
        String content,
        //UsersReferenceDto users,
        PostReferenceDto posts,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
