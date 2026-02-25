package liv.codveda.blog.app.domain.dto.response;

import liv.codveda.blog.app.domain.dto.reference.CommentReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.UsersReferenceDto;
import liv.codveda.blog.app.domain.enums.Category;

import java.time.LocalDateTime;
import java.util.List;

public record PostDto(
        Long id,
        String title,
        Category category,
        String content,
        UsersReferenceDto user,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CommentReferenceDto> comments,
        Long likes,
        Long views,
        Boolean isLiked
) {
}
