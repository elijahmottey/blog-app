package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPost(Post post);
}
