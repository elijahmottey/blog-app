package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.PostReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PostReportRepository extends JpaRepository<PostReport, Long> {
    Page<PostReport> findAllByOrderByCreatedAtDesc(Pageable pageable);
    boolean existsByPostIdAndReporterId(Long postId, Long reporterId);
}
