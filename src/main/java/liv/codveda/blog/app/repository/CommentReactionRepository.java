package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.CommentReaction;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommentReactionRepository extends JpaRepository<CommentReaction, Long> {
    Optional<CommentReaction> findByUserAndComment(Users user, Comment comment);

    long countByCommentAndType(Comment comment, ReactionType type);

    @Query("select cr.type from CommentReaction cr where cr.user = :user and cr.comment = :comment")
    Optional<ReactionType> findTypeByUserAndComment(@Param("user") Users user, @Param("comment") Comment comment);

    long countByType(ReactionType type);

    // total reactions on comments for posts owned by a user (author engagement on comments)
    long countByComment_Post_Users_IdAndType(Long userId, ReactionType type);
}
