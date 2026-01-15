package liv.codveda.blog.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class PostBlogServiceImpl implements BlogService {

    private final PostRepository postRepository;
    private final UsersRepository userRepository;

    @Autowired
    public PostBlogServiceImpl(PostRepository postRepository, UsersRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public Post postBlog(Post post) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
        post.setUsers(user);

        Post savedPost = postRepository.save(post);

        // Cache the saved post
        return savedPost;
    }

    @Override
    @Transactional
    @CacheEvict(value = "posts", allEntries = true)
    public void deletePost(Long id) {
        Post post = this.getPostById(id);
        this.postRepository.delete(post);
    }

    @Override
    @Cacheable(value = "posts", unless = "#result.isEmpty()")
    public Page<Post> getAllPosts(Pageable pageable) {
        return this.postRepository.findAll(pageable);
    }

    @Override
    @Cacheable(value = "post", key = "#id")
    public Post getPostById(Long id) {
        return this.postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post with id " + id + " not found"));
    }

    @Override
    @Cacheable(value = "posts", key = "#title")
    public Page<Post> getPostByTitle(String title, Pageable pageable) {
        return postRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    @Transactional
    @Caching(
            put = {
                    @CachePut(value = "post", key = "#id", unless = "#result == null")
            },
            evict = {
                    @CacheEvict(value = "posts", allEntries = true)
            }
    )
    public Post updatePost(Long id, Post post) {
        Post existingPost = this.getPostById(id);
        if (post.getTitle() != null) existingPost.setTitle(post.getTitle());
        if (post.getContent() != null) existingPost.setContent(post.getContent());
        return postRepository.save(existingPost);
    }
}
