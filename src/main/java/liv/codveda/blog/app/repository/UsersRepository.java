package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UsersRepository extends JpaRepository<Users, Integer> {

    Optional<Users> findByEmail(String email);
    boolean existsByEmail(String email);

}
