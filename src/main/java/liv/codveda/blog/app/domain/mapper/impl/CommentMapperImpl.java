package liv.codveda.blog.app.domain.mapper.impl;

import liv.codveda.blog.app.domain.dto.response.CommentDto;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.mapper.interfaces.CommentMapper;
import liv.codveda.blog.app.domain.mapper.interfaces.ReferenceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CommentMapperImpl implements CommentMapper {
    private final ReferenceMapper referenceMapper;
    @Autowired
    public CommentMapperImpl(ReferenceMapper referenceMapper) {
        this.referenceMapper = referenceMapper;
    }

    @Override
    public Comment commentDtoToComment(CommentDto commentDto) {
        if (commentDto == null) return null;
        Comment comment = new Comment();
        comment.setId(commentDto.id());
        comment.setContent(commentDto.content());
        comment.setCreatedAt(commentDto.createdAt());
        comment.setUpdatedAt(commentDto.updatedAt());
        return comment;
    }

    @Override
    public CommentDto commentToCommentDto(Comment comment) {
        if (comment == null) return null;
        return new CommentDto(
                comment.getId(),
                comment.getContent(),
               // referenceMapper.toUsersReference(comment.getUsers()),
                referenceMapper.toPostReference(comment.getPost()),
                comment.getCreatedAt(),
                comment.getUpdatedAt()

        );
    }
}
