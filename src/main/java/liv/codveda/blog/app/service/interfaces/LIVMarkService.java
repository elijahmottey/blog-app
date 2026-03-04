package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.domain.Pageable;

public interface LIVMarkService {
    void toggleLIVMark(Long postId, Users user);
    boolean isLIVMarked(Long postId, Users user);
    Paged<PostDto> getLIVMarkedPosts(Users user, Pageable pageable);
}