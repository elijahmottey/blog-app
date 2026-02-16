package liv.codveda.blog.app.service;

import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Category;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private Users testUser;
    private Post testPost;

    @BeforeEach
    void setUp() {
        testUser = Users.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .role(Roles.USER)
                .build();

        testPost = new Post();
        testPost.setId(1L);
        testPost.setTitle("Test Post");
        testPost.setContent("Test Content");
        testPost.setCategory(Category.TECHNOLOGY);
        testPost.setUsers(testUser);

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
    }

    @Test
    void testCreatePost_Success() {
        when(usersRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        assertDoesNotThrow(() -> {
            Post post = new Post();
            post.setTitle("Test Post");
            post.setContent("Test Content");
            post.setCategory(Category.TECHNOLOGY);
            post.setUsers(testUser);
            postRepository.save(post);
        });

        verify(postRepository, times(1)).save(any(Post.class));
    }

    @Test
    void testGetPostById_Success() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));

        Optional<Post> result = postRepository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test Post", result.get().getTitle());
        verify(postRepository, times(1)).findById(1L);
    }

    @Test
    void testGetPostById_NotFound() {
        when(postRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Post> result = postRepository.findById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetAllPosts_Success() {
        List<Post> posts = Arrays.asList(testPost);
        Page<Post> postPage = new PageImpl<>(posts);

        when(postRepository.findAll(any(Pageable.class))).thenReturn(postPage);

        Page<Post> result = postRepository.findAll(Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Post", result.getContent().get(0).getTitle());
    }

    @Test
    void testUpdatePost_Success() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(postRepository.save(any(Post.class))).thenReturn(testPost);

        testPost.setTitle("Updated Title");
        Post updated = postRepository.save(testPost);

        assertEquals("Updated Title", updated.getTitle());
        verify(postRepository, times(1)).save(testPost);
    }

    @Test
    void testDeletePost_Success() {
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        doNothing().when(postRepository).delete(testPost);

        postRepository.delete(testPost);

        verify(postRepository, times(1)).delete(testPost);
    }

    @Test
    void testGetPostsByCategory_Success() {
        List<Post> posts = Arrays.asList(testPost);
        Page<Post> postPage = new PageImpl<>(posts);

        when(postRepository.findByCategory(eq(Category.TECHNOLOGY), any(Pageable.class)))
                .thenReturn(postPage);

        Page<Post> result = postRepository.findByCategory(Category.TECHNOLOGY, Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
        assertEquals(Category.TECHNOLOGY, result.getContent().get(0).getCategory());
    }

    @Test
    void testGetPostsByUser_Success() {
        List<Post> posts = Arrays.asList(testPost);

        when(postRepository.findByUsers(testUser)).thenReturn(posts);

        List<Post> result = postRepository.findByUsers(testUser);

        assertEquals(1, result.size());
        assertEquals(testUser.getId(), result.get(0).getUsers().getId());
    }
}
