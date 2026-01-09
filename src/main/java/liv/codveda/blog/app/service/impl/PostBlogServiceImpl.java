package liv.codveda.blog.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.service.interfaces.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class PostBlogServiceImpl implements BlogService {
    private final PostRepository postRepository;
    @Autowired
    public PostBlogServiceImpl(PostRepository postRepository, BlogService blogService) {
        this.postRepository = postRepository;
    }

    @Override
    public Post postBlog(Post post) {
        return postRepository.save(post);
    }

    @Override
    public void deletePost(Long id) {
        this.getPostById(id);
        this.postRepository.deleteById(id);


    }

    @Override
    public List<Post> getPosts() {
        return this.postRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Override
    public Post getPostById(Long id) {
        return this.postRepository.findById(id)
                .orElseThrow(
                        ()-> new EntityNotFoundException("user with "+id +" not found"));
    }

    @Override
    public Post getPostByTitle(String title) {
        return postRepository.getPostByTitle(title);
    }

    @Override
    public Post updatePost(Long id, Post post) {
        if(!Objects.equals(post.getId(), id))
            throw new EntityNotFoundException("user with "+id +" not found");
        Post existingPost = this.getPostById(id);
        if(post.getTitle() != null) existingPost.setTitle(post.getTitle());
        if (post.getContent() != null) existingPost.setContent(post.getContent());
        return postRepository.save(existingPost);
    }
}
