package liv.codveda.blog.app.domain.mapper.impl;

import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.mapper.interfaces.PostMapper;
import liv.codveda.blog.app.domain.mapper.interfaces.ReferenceMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;
@Component
public class PostMapperImpl implements PostMapper {
    private final ReferenceMapper referenceMapper;
    @Autowired
    public PostMapperImpl(ReferenceMapper referenceMapper) {
        this.referenceMapper = referenceMapper;
    }

    @Override
    public Post postDtoToPost(PostDto postDto) {
        if (postDto == null) return null;
        Post post = new Post();
        post.setId(postDto.id());
        post.setTitle(postDto.title());
        post.setCreatedAt(postDto.createdAt());
        post.setUpdatedAt(postDto.updatedAt());
        return post;
    }

    @Override
    public PostDto postToPostDto(Post post) {
        return new PostDto(
                post.getId(),
                post.getTitle(),
                post.getContent(),
                referenceMapper.toUsersReference(post.getUsers()),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                Optional.ofNullable(post.getComments())
                        .map(comments -> comments
                                .stream()
                                .map(referenceMapper::toCommentReference)
                                .toList()
                        ).orElse(null)
        );
    }
}
