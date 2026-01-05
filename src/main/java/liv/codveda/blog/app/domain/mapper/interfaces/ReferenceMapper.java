package liv.codveda.blog.app.domain.mapper.interfaces;

import liv.codveda.blog.app.domain.dto.reference.CommentReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.PostReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.UsersReferenceDto;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;

public interface ReferenceMapper {
    UsersReferenceDto toUsersReference(Users user);
    PostReferenceDto toPostReference(Post post);
    CommentReferenceDto toCommentReference(Comment comment);
}
