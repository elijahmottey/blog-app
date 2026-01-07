package liv.codveda.blog.app.domain.dto.response;

import liv.codveda.blog.app.domain.dto.reference.CommentReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.UsersReferenceDto;

import java.time.LocalDateTime;
import java.util.List;

public record PostDto(
        Long id,
        String title,
        String content,
        UsersReferenceDto user,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CommentReferenceDto> comments

) {
}
