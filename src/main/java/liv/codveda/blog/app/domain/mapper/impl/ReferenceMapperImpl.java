package liv.codveda.blog.app.domain.mapper.impl;

import liv.codveda.blog.app.domain.dto.reference.CommentReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.PostReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.UsersReferenceDto;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.mapper.interfaces.ReferenceMapper;
import org.springframework.stereotype.Component;

@Component
public class ReferenceMapperImpl implements ReferenceMapper {
    @Override
    public UsersReferenceDto toUsersReference(Users user) {

        if (user == null)
            return null;

        return new UsersReferenceDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getDescription(),
                user.getAvatar(),
                user.getRole());
    }

    @Override
    public PostReferenceDto toPostReference(Post post) {
        if (post == null)
            return null;
        return new PostReferenceDto(
                post.getId(),
                post.getTitle(),
                post.getCategory(),
                post.getContent());
    }

    @Override
    public CommentReferenceDto toCommentReference(Comment comment) {
        if (comment == null)
            return null;
        return new CommentReferenceDto(
                comment.getId(),
                comment.getContent(),
                comment.getPost() != null ? comment.getPost().getTitle() : null);
    }
}
