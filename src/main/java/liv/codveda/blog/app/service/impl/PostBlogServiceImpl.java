package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.service.interfaces.BlogService;

import java.util.List;

public class PostBlogServiceImpl implements BlogService {
    @Override
    public Post postBlog(Post post) {
        return null;
    }

    @Override
    public void deletePost(Long id) {

    }

    @Override
    public List<Post> getPosts() {
        return List.of();
    }

    @Override
    public Post getPostById(Long id) {
        return null;
    }

    @Override
    public Post getPostByTitle(String title) {
        return null;
    }

    @Override
    public Post updatePost(Long id, Post post) {
        return null;
    }
}
