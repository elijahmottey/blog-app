package liv.codveda.blog.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Category;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.BlogService;
import liv.codveda.blog.app.service.interfaces.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Stream;

@Service
public class PostBlogServiceImpl implements BlogService {

    private final PostRepository postRepository;
    private final UsersRepository userRepository;
    private final NotificationService notificationService;
    private final BlogService self; // Self-reference for proxy calls

    @Autowired
    public PostBlogServiceImpl(PostRepository postRepository,
            UsersRepository userRepository,
            NotificationService notificationService,
            @Lazy BlogService blogService) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.self = blogService;
    }

    private Users getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new EntityNotFoundException("Authentication required");
        }
        if (auth.getPrincipal() instanceof Users) {
            return (Users) auth.getPrincipal();
        }
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + auth.getName()));
    }

    private boolean isAdmin(Users user) {
        return user.getRole() == Roles.ADMIN;
    }

    // Helper method to check post ownership or admin
    private void checkPostOwnershipOrAdmin(Post post) {
        Users currentUser = getAuthenticatedUser();
        boolean owner = post.getUsers().getId().equals(currentUser.getId());
        if (!(owner || isAdmin(currentUser))) {
            throw new AccessDeniedException(
                    "You are not authorized to modify or delete this post");
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = { "posts", "postById", "postByTitle", "postsByCategory", "postTotal" }, allEntries = true)
    public Post postBlog(Post post) {
        Users user = getAuthenticatedUser();
        post.setUsers(user);
        Post savedPost = postRepository.save(post);

        // Notify all other users
        List<Users> allUsers = userRepository.findAll();
        for (Users u : allUsers) {
            if (!u.getId().equals(user.getId())) {
                notificationService.createNotification(
                        u,
                        "NEW_POST",
                        user.getName() + " published a new post: " + savedPost.getTitle(),
                        savedPost.getId());
            }
        }
        return savedPost;
    }

    @Override
    @Transactional
    @CacheEvict(value = { "posts", "postById", "postByTitle", "postsByCategory", "postTotal" }, allEntries = true)
    public void deletePost(Long id) {
        // Use the proxy to get cached post
        Post post = self.getPostById(id); // ✅ Now uses cache
        checkPostOwnershipOrAdmin(post);
        postRepository.delete(post);
    }

    @Override
    @Cacheable(value = "posts", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort")
    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    @Override
    @Cacheable(value = "postById", key = "#id")
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Post with id " + id + " not found"));
    }

    @Override
    @Cacheable(value = "postByTitle", key = "#title + '-' + #pageable.pageNumber")
    public Page<Post> getPostByTitle(String title, Pageable pageable) {
        return postRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "posts", "postById", "postByTitle", "postsByCategory", "postTotal" }, allEntries = true)
    public Post updatePost(Long id, Post post) {
        // Use the proxy to get cached post
        Post existingPost = self.getPostById(id); // ✅ Now uses cache
        checkPostOwnershipOrAdmin(existingPost);

        Users currentUser = getAuthenticatedUser(); // Get the current user for notifications

        // Track if title changed for notification
        String oldTitle = existingPost.getTitle();
        boolean titleChanged = false;

        if (post.getTitle() != null && !post.getTitle().equals(existingPost.getTitle())) {
            existingPost.setTitle(post.getTitle());
            titleChanged = true;
        }
        if (post.getContent() != null) {
            existingPost.setContent(post.getContent());
        }
        if (post.getCategory() != null) {
            existingPost.setCategory(post.getCategory());
        }

        Post updatedPost = postRepository.save(existingPost);

        // Notify all other users about the update
        List<Users> allUsers = userRepository.findAll();
        String notificationMessage = titleChanged
                ? currentUser.getName() + " updated a post: " + oldTitle + " → " + updatedPost.getTitle()
                : currentUser.getName() + " updated a post: " + updatedPost.getTitle();

        for (Users u : allUsers) {
            if (!u.getId().equals(currentUser.getId())) {
                notificationService.createNotification(
                        u,
                        "UPDATE_POST",
                        notificationMessage,
                        updatedPost.getId());
            }
        }

        return updatedPost;
    }

    @Override
    @Cacheable(value = "postsByCategory", key = "#category + '-' + #pageable.pageNumber")
    public Page<Post> getPostsByCategory(Category category, Pageable pageable) {
        return postRepository.findByCategory(category, pageable);
    }

    @Override
    @Cacheable(value = "postTotal")
    public Integer getTotalPosts() {
        return Math.toIntExact(postRepository.count());
    }

    public List<String> getAllCategories() {
        return Stream.of(
                "Spiritual",
                "Technology",
                "health",
                "Leadership",
                "Culture",
                "Business",
                "Education",
                "Sport",
                "Politics").toList();
    }
}