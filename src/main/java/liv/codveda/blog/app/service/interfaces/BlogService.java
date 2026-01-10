package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.entities.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface BlogService {
    Post postBlog(Post post);
    void deletePost(Long id);
    List<Post> getPosts();
    Post getPostById(Long id);
    Page<Post> getPostByTitle(String title, Pageable pageable);
    Post updatePost(Long id,Post post);

}
