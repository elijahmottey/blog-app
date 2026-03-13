package liv.codveda.blog.app.service;

import liv.codveda.blog.app.domain.dto.request.ChatMessageRequest;
import liv.codveda.blog.app.domain.dto.response.ChatMessageResponse;
import liv.codveda.blog.app.domain.entities.ChatMessage;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.repository.ChatMessageRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

        private final ChatMessageRepository chatMessageRepository;
        private final UsersRepository userRepository;
        private final SimpMessagingTemplate messagingTemplate;

        @Transactional
        public ChatMessageResponse processMessage(Long senderId, ChatMessageRequest request) {
                if (senderId == null) {
                    throw new IllegalArgumentException("Sender ID cannot be null");
                }
                
                log.info("Processing chat message from {} to {}", senderId, request.getRecipientId());

                Users sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));

                Users recipient = userRepository.findById(request.getRecipientId())
                                .orElseThrow(() -> new RuntimeException(
                                                "Recipient not found: " + request.getRecipientId()));

                ChatMessage chatMessage = ChatMessage.builder()
                                .sender(sender)
                                .recipient(recipient)
                                .content(request.getContent())
                                .postId(request.getPostId())
                                .isRead(false)
                                .build();

                ChatMessage savedMessage = chatMessageRepository.save(chatMessage);

                ChatMessageResponse response = mapToResponse(savedMessage);

                // Send via WebSocket to specific user queue (recipient)
                String recipientDestination = "/topic/messages/" + recipient.getId();
                log.info("Sending message to recipient destination: {}", recipientDestination);
                messagingTemplate.convertAndSend(recipientDestination, response);

                // OPTIONAL: Send back to sender as confirmation (so they see it on other devices instantly)
                String senderDestination = "/topic/messages/" + sender.getId();
                log.info("Sending message back to sender destination: {}", senderDestination);
                messagingTemplate.convertAndSend(senderDestination, response);

                return response;
        }

        @Transactional
        public void markMessagesAsRead(Long readerId, Long senderId) {
                if (readerId == null || senderId == null) return;
                
                Users reader = userRepository.findById(readerId)
                                .orElseThrow(() -> new RuntimeException("Reader not found: " + readerId));
                Users sender = userRepository.findById(senderId)
                                .orElseThrow(() -> new RuntimeException("Sender not found: " + senderId));

                List<ChatMessage> unreadMessages = chatMessageRepository.findBySenderAndRecipientAndIsReadFalse(sender,
                                reader);

                if (unreadMessages.isEmpty()) {
                        return;
                }

                for (ChatMessage msg : unreadMessages) {
                        msg.setRead(true);
                }

                chatMessageRepository.saveAll(unreadMessages);

                // Notify the sender that their messages have been read
                String destination = "/topic/messages/" + senderId;
                log.info("Sending read receipt notification to destination: {}", destination);

                // We can send a specialized object or just resend the updated messages.
                // For simplicity, we send a read receipt notification map.
                java.util.Map<String, Object> receipt = new java.util.HashMap<>();
                receipt.put("type", "READ_RECEIPT");
                receipt.put("readerId", readerId);

                messagingTemplate.convertAndSend(destination, (Object) receipt);
        }

        @Transactional(readOnly = true)
        public List<ChatMessageResponse> getChatHistory(Long user1Id, Long user2Id) {
                if (user1Id == null || user2Id == null) {
                    return List.of();
                }

                Users user1 = userRepository.findById(user1Id)
                                .orElseThrow(() -> new RuntimeException("User not found: " + user1Id));

                Users user2 = userRepository.findById(user2Id)
                                .orElseThrow(() -> new RuntimeException("User not found: " + user2Id));

                return chatMessageRepository.findChatHistory(user1, user2)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        private ChatMessageResponse mapToResponse(ChatMessage message) {
                return ChatMessageResponse.builder()
                                .id(message.getId())
                                .senderId(message.getSender().getId())
                                .recipientId(message.getRecipient().getId())
                                .content(message.getContent())
                                .postId(message.getPostId())
                                .timestamp(message.getTimestamp())
                                .isRead(message.isRead())
                                .build();
        }
}
