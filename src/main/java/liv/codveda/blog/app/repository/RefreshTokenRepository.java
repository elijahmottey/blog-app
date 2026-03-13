package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.RefreshToken;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);

    Optional<RefreshToken> findByUser(Users user);

    @Modifying
    int deleteByUser(Users user);
}
