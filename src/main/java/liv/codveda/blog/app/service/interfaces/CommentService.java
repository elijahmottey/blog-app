package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;

import java.util.List;

public interface CommentService {
    Comment createComment(Comment comment);
    void deleteComment(Comment comment);
    List<Comment> getCommentsByPost(Post post);
    Comment getCommentById(long id);
    Comment updateComment(Comment comment);

}
