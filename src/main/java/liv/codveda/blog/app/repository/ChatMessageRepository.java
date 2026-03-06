package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.ChatMessage;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE (m.sender = :user1 AND m.recipient = :user2) OR (m.sender = :user2 AND m.recipient = :user1) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("user1") Users user1, @Param("user2") Users user2);
}
