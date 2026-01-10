package liv.codveda.blog.app.repository;

import org.springframework.cache.annotation.Cacheable;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface UsersRepository extends JpaRepository<Users, Long> {

    //@Cacheable(value = "users", key = "#email")
    Optional<Users> findByEmail(String email);

    boolean existsByEmail(String email);

}
