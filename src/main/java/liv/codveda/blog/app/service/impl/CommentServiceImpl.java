package liv.codveda.blog.app.service.impl;

import jakarta.transaction.Transactional;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
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

    private final UserService userService;
    private final BlogService blogService;
    private final CommentRepository commentRepository;

    @Autowired
    public CommentServiceImpl(UserService userService, BlogService blogService, CommentRepository commentRepository) {
        this.userService = userService;
        this.blogService = blogService;
        this.commentRepository = commentRepository;
    }

    @Override
    @Transactional
    public Comment createComment(Long postId, Comment comment) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Users user = userService.getMyInfo(email);
        Post post = blogService.getPostById(postId);
        comment.setPost(post);
        comment.setUsers(user);

        return commentRepository.save(comment);
    }

    @Override
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }

    @Override
    public Page<Comment> getCommentsByPost(Pageable pageable) {
        return this.commentRepository.findAll(pageable);
    }


    @Override
    public Comment getCommentById(long id) {
        return commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + id));
    }

    @Override
    @Transactional
    public Comment updateComment(Comment comment) {
        Comment existingComment = getCommentById(comment.getId());
        existingComment.setContent(comment.getContent());
        return commentRepository.save(existingComment);
    }
}
