package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CommentService {
    Comment createComment(Long postId,Comment comment);
    void deleteComment(Long id);
    Page<Comment> getCommentsByPost(Pageable pageable);
    Comment getCommentById(long id);
    Comment updateComment(Comment comment);

}
