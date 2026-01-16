package liv.codveda.blog.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
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

    // 🔐 Helper method to get authenticated user
    private Users getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new EntityNotFoundException("User not found with email: " + email));
    }

    // 🔐 Helper method to check post ownership
    private void checkPostOwnership(Post post) {
        Users currentUser = getAuthenticatedUser();

        if (!post.getUsers().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You are not authorized to modify or delete this post");
        }
    }

    @Override
    @Transactional
    public Post postBlog(Post post) {
        Users user = getAuthenticatedUser();
        post.setUsers(user);
        return postRepository.save(post);
    }

    @Override
    @Transactional
    public void deletePost(Long id) {
        Post post = getPostById(id);
        checkPostOwnership(post);
        postRepository.delete(post);
    }

    @Override
    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    @Override
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Post with id " + id + " not found"));
    }

    @Override
    public Page<Post> getPostByTitle(String title, Pageable pageable) {
        return postRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    @Transactional
    public Post updatePost(Long id, Post post) {
        Post existingPost = getPostById(id);
        checkPostOwnership(existingPost);

        if (post.getTitle() != null) {
            existingPost.setTitle(post.getTitle());
        }
        if (post.getContent() != null) {
            existingPost.setContent(post.getContent());
        }

        return postRepository.save(existingPost);
    }
}
