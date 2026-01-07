package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository  extends JpaRepository<Post, Long> {

}
