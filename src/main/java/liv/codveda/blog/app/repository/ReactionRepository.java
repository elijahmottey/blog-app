package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Reaction;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, Long> {
    Optional<Reaction> findByUserAndPost(Users user, Post post);

    long countByPostAndType(Post post, ReactionType type);

    @Query("select r.type from Reaction r where r.user = :user and r.post = :post")
    Optional<ReactionType> findTypeByUserAndPost(@Param("user") Users user, @Param("post") Post post);

    long countByType(ReactionType type);

    long countByPost_Users_IdAndType(Long userId, ReactionType type);
}
