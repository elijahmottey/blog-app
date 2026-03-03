package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Notification;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    Page<Notification> findByUserOrderByCreatedAtDesc(Users user, Pageable pageable);
    Long countByUserAndIsReadFalse(Users user);
}
