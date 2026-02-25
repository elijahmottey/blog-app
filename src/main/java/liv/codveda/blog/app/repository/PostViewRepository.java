package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.PostView;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PostViewRepository extends JpaRepository<PostView, Long> {
    Optional<PostView> findByUserAndPost(Users user, Post post);
    long countByPost(Post post);
    long countByPost_Users_Id(Long userId);
}