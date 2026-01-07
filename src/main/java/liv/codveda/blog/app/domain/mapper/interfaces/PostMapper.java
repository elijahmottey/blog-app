package liv.codveda.blog.app.domain.mapper.interfaces;

import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.entities.Post;

public interface PostMapper {
    Post postDtoToPost(PostDto postDto);
    PostDto postToPostDto(Post post);
}
