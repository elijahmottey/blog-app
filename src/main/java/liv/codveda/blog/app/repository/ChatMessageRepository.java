package liv.codveda.blog.app.repository;

import liv.codveda.blog.app.domain.entities.ChatMessage;
import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

    @Query("SELECT m FROM ChatMessage m WHERE (m.sender.id = :user1Id AND m.recipient.id = :user2Id) OR (m.sender.id = :user2Id AND m.recipient.id = :user1Id) ORDER BY m.timestamp ASC")
    List<ChatMessage> findChatHistory(@Param("user1Id") Long user1Id, @Param("user2Id") Long user2Id);

    @Query("SELECT m FROM ChatMessage m WHERE m.sender.id = :senderId AND m.recipient.id = :recipientId AND m.isRead = false")
    List<ChatMessage> findUnreadMessages(@Param("senderId") Long senderId, @Param("recipientId") Long recipientId);

    @Query("SELECT DISTINCT m.recipient.id FROM ChatMessage m WHERE m.sender.id = :userId")
    List<Long> findPartnerIdsWhereUserIsSender(@Param("userId") Long userId);

    @Query("SELECT DISTINCT m.sender.id FROM ChatMessage m WHERE m.recipient.id = :userId")
    List<Long> findPartnerIdsWhereUserIsRecipient(@Param("userId") Long userId);
}
