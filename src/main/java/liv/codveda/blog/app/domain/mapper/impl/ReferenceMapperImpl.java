package liv.codveda.blog.app.domain.mapper.impl;

import liv.codveda.blog.app.domain.dto.reference.CommentReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.PostReferenceDto;
import liv.codveda.blog.app.domain.dto.reference.UsersReferenceDto;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.mapper.interfaces.ReferenceMapper;

public class ReferenceMapperImpl implements ReferenceMapper {
    @Override
    public UsersReferenceDto toUsersReference(Users user) {
        return null;
    }

    @Override
    public PostReferenceDto toPostReference(Post post) {
        return null;
    }

    @Override
    public CommentReferenceDto toCommentReference(Comment comment) {
        return null;
    }
}
