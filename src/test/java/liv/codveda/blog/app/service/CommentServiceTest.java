package liv.codveda.blog.app.service;

import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.CommentRepository;
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
class CommentServiceTest {

    @Mock
    private CommentRepository commentRepository;

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
    private Comment testComment;

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
        testPost.setUsers(testUser);

        testComment = new Comment();
        testComment.setId(1L);
        testComment.setContent("Test Comment");
        testComment.setUsers(testUser);
        testComment.setPost(testPost);

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
    }

    @Test
    void testCreateComment_Success() {
        when(usersRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(postRepository.findById(1L)).thenReturn(Optional.of(testPost));
        when(commentRepository.save(any(Comment.class))).thenReturn(testComment);

        Comment comment = new Comment();
        comment.setContent("Test Comment");
        comment.setUsers(testUser);
        comment.setPost(testPost);

        Comment saved = commentRepository.save(comment);

        assertNotNull(saved);
        assertEquals("Test Comment", saved.getContent());
        verify(commentRepository, times(1)).save(any(Comment.class));
    }

    @Test
    void testGetCommentById_Success() {
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));

        Optional<Comment> result = commentRepository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test Comment", result.get().getContent());
    }

    @Test
    void testGetCommentById_NotFound() {
        when(commentRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Comment> result = commentRepository.findById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetCommentsByPostId_Success() {
        List<Comment> comments = Arrays.asList(testComment);
        Page<Comment> commentPage = new PageImpl<>(comments);

        when(commentRepository.findAllByPostId(eq(1L), any(Pageable.class)))
                .thenReturn(commentPage);

        Page<Comment> result = commentRepository.findAllByPostId(1L, Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
        assertEquals("Test Comment", result.getContent().get(0).getContent());
    }

    @Test
    void testGetCommentsByUser_Success() {
        List<Comment> comments = Arrays.asList(testComment);
        Page<Comment> commentPage = new PageImpl<>(comments);

        when(commentRepository.findAll(any(Pageable.class))).thenReturn(commentPage);

        Page<Comment> result = commentRepository.findAll(Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testUpdateComment_Success() {
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));
        when(commentRepository.save(any(Comment.class))).thenReturn(testComment);

        testComment.setContent("Updated Comment");
        Comment updated = commentRepository.save(testComment);

        assertEquals("Updated Comment", updated.getContent());
        verify(commentRepository, times(1)).save(testComment);
    }

    @Test
    void testDeleteComment_Success() {
        when(commentRepository.findById(1L)).thenReturn(Optional.of(testComment));
        doNothing().when(commentRepository).delete(testComment);

        commentRepository.delete(testComment);

        verify(commentRepository, times(1)).delete(testComment);
    }

    @Test
    void testGetAllComments_Success() {
        List<Comment> comments = Arrays.asList(testComment);
        Page<Comment> commentPage = new PageImpl<>(comments);

        when(commentRepository.findAll(any(Pageable.class))).thenReturn(commentPage);

        Page<Comment> result = commentRepository.findAll(Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
    }

    @Test
    void testCountComments_Success() {
        when(commentRepository.count()).thenReturn(10L);

        long count = commentRepository.count();

        assertEquals(10L, count);
    }

    @Test
    void testCreateComment_PostNotFound() {
        when(usersRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(postRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Post> post = postRepository.findById(999L);

        assertFalse(post.isPresent());
    }

    @Test
    void testCreateComment_UserNotFound() {
        when(usersRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        Optional<Users> user = usersRepository.findByEmail("nonexistent@example.com");

        assertFalse(user.isPresent());
    }
}
