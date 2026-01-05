package liv.codveda.blog.app.domain.mapper.interfaces;

import liv.codveda.blog.app.domain.dto.response.CommentDto;
import liv.codveda.blog.app.domain.entities.Comment;

public interface CommentMapper {
    Comment commentDtoToComment(CommentDto commentDto);
    CommentDto commentToCommentDto(Comment comment);
}
