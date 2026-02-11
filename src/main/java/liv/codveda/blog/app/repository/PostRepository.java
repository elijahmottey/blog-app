package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.enums.Category;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface PostRepository extends JpaRepository<Post, Long> {
    Page<Post> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Find posts by exact category match (case-insensitive)
    Page<Post> findByCategoryIgnoreCase(Category category, Pageable pageable);

    // Return distinct non-null categories
    @Query("select distinct p.category from Post p where p.category is not null")
    List<String> findDistinctCategories();

   // List<String>findByCategoryIgnoreCase(Category category);
}
