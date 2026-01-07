package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CommentRepository extends JpaRepository<Comment, Long> {

}
