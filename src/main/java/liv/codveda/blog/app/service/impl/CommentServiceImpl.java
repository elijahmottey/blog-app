
package liv.codveda.blog.app.service.impl;

import jakarta.transaction.Transactional;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.exception.ResourceNotFoundException;
import liv.codveda.blog.app.exception.UnauthorizedOperationException;
import liv.codveda.blog.app.repository.CommentRepository;
import liv.codveda.blog.app.service.interfaces.BlogService;
import liv.codveda.blog.app.service.interfaces.CommentService;
import liv.codveda.blog.app.service.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CommentServiceImpl implements CommentService {

    private final BlogService blogService;
    private final CommentRepository commentRepository;

    @Autowired
    public CommentServiceImpl(BlogService blogService, CommentRepository commentRepository) {
        this.blogService = blogService;
        this.commentRepository = commentRepository;
    }

    private Users getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedOperationException("User must be authenticated");
        }
        return (Users) authentication.getPrincipal();
    }

    @Override
    @Transactional
    public Comment createComment(Long postId, Comment comment) {
        Users user = getCurrentUser();
        Post post = blogService.getPostById(postId);

        comment.setPost(post);
        comment.setUsers(user);

        return commentRepository.save(comment);
    }

    @Override
    @Transactional
    public void deleteComment(Long id) {
        Comment comment = getCommentById(id);
        Users currentUser = getCurrentUser();

        if (!comment.getUsers().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("You can only delete your own comments");
        }

        commentRepository.deleteById(id);
    }

    @Override
    public Page<Comment> getCommentsByPost(Pageable pageable) {
        // This method should probably be removed or marked as deprecated
        // as it returns all comments instead of filtering by post
        return this.commentRepository.findAll(pageable);
    }

    @Override
    public Page<Comment> getCommentsByPostById(Long postId, Pageable pageable) {
        return this.commentRepository.findAllByPostId(postId, pageable);
    }

    @Override
    public Comment getCommentById(long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found with id: " + id));
    }

    @Override
    @Transactional
    public Comment updateComment(Comment comment) {
        Comment existingComment = getCommentById(comment.getId());
        Users currentUser = getCurrentUser();

        if (!existingComment.getUsers().getId().equals(currentUser.getId())) {
            throw new UnauthorizedOperationException("You can only update your own comments");
        }

        existingComment.setContent(comment.getContent());
        return commentRepository.save(existingComment);
    }

    @Override
    public Integer getTotalComments() {
        return Math.toIntExact(commentRepository.count());
    }
}