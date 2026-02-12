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
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
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

    private boolean isAdmin(Users user) {
        return user.getRole() == Roles.ADMIN;
    }

    //  Helper method to check post ownership or admin
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
    @CacheEvict(value = {"posts", "postById", "postByTitle"}, allEntries = true)
    public Post postBlog(Post post) {
        Users user = getAuthenticatedUser();
        post.setUsers(user);
        return postRepository.save(post);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "postById", "postByTitle"}, allEntries = true)
    public void deletePost(Long id) {
        Post post = getPostById(id);
        checkPostOwnershipOrAdmin(post);
        postRepository.delete(post);
    }

    @Override
    @Cacheable(value = "posts")
    public Page<Post> getAllPosts(Pageable pageable) {
        return postRepository.findAll(pageable);
    }

    @Override
    @Cacheable(value = "postById", key = "#id")
    public Post getPostById(Long id) {
        return postRepository.findById(id)
                .orElseThrow(() ->
                        new EntityNotFoundException("Post with id " + id + " not found"));
    }

    @Override
    @Cacheable(value = "postByTitle", key = "#title + '-' + #pageable.pageNumber")
    public Page<Post> getPostByTitle(String title, Pageable pageable) {
        return postRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"posts", "postById", "postByTitle"}, allEntries = true)
    public Post updatePost(Long id, Post post) {
        Post existingPost = getPostById(id);
        checkPostOwnershipOrAdmin(existingPost);

        if (post.getTitle() != null) {
            existingPost.setTitle(post.getTitle());
        }
        if (post.getContent() != null) {
            existingPost.setContent(post.getContent());
        }
        if (post.getCategory() != null) {
            existingPost.setCategory(post.getCategory());
        }

        return postRepository.save(existingPost);
    }

    @Override
    public Integer getTotalPosts() {
        return Math.toIntExact(postRepository.count());
    }

    @Override
    public Page<Post> getPostsByCategory(Category category, Pageable pageable) {
        return postRepository.findByCategoryIgnoreCase(category, pageable);
    }

    public List<String> getAllCategories() {
         return Stream.of(
                "Spiritual Life",
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
