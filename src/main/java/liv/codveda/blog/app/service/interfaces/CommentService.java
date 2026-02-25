package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.entities.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CommentService {
    Comment createComment(Long postId, Comment comment);
    Comment createReply(Long postId, Long parentCommentId, Comment comment);
    void deleteComment(Long id);
    Page<Comment> getCommentsByPost(Pageable pageable);
    Page<Comment> getCommentsByPostById(Long id, Pageable pageable);
    Comment getCommentById(long id);
    Comment updateComment(Comment comment);
    Integer getTotalComments();

}
