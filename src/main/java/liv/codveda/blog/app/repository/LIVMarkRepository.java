package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.LIVMark;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LIVMarkRepository extends JpaRepository<LIVMark, Long> {
    boolean existsByUserAndPost(Users user, Post post);
    Optional<LIVMark> findByUserAndPost(Users user, Post post);
    Page<LIVMark> findByUser(Users user, Pageable pageable);
}