package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.entities.Post;

import java.util.List;

public interface BlogService {
    Post postBlog(Post post);
    void deletePost(Long id);
    List<Post> getPosts();
    Post getPostById(Long id);
    Post getPostByTitle(String title);
    Post updatePost(Long id,Post post);

}
