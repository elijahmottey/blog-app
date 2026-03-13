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

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
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
                try {
                    messagingTemplate.convertAndSend(recipientDestination, response);
                } catch (Exception e) {
                    log.error("Failed to send WebSocket message to recipient: {}", e.getMessage());
                }

                // Send back to sender as confirmation (so they see it on other devices instantly)
                String senderDestination = "/topic/messages/" + sender.getId();
                log.info("Sending message back to sender destination: {}", senderDestination);
                try {
                    messagingTemplate.convertAndSend(senderDestination, response);
                } catch (Exception e) {
                    log.error("Failed to send WebSocket message to sender: {}", e.getMessage());
                }

                return response;
        }

        @Transactional
        public void markMessagesAsRead(Long readerId, Long senderId) {
                if (readerId == null || senderId == null) return;
                
                List<ChatMessage> unreadMessages = chatMessageRepository.findUnreadMessages(senderId, readerId);

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

                java.util.Map<String, Object> receipt = new java.util.HashMap<>();
                receipt.put("type", "READ_RECEIPT");
                receipt.put("readerId", readerId);

                try {
                    messagingTemplate.convertAndSend(destination, (Object) receipt);
                } catch (Exception e) {
                    log.error("Failed to send WebSocket read receipt: {}", e.getMessage());
                }
        }

        @Transactional(readOnly = true)
        public List<ChatMessageResponse> getChatHistory(Long user1Id, Long user2Id) {
                if (user1Id == null || user2Id == null) {
                    return List.of();
                }

                return chatMessageRepository.findChatHistory(user1Id, user2Id)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(readOnly = true)
        public List<Map<String, Object>> getConversations(Long userId) {
                // Find all unique user IDs that the current user has chatted with
                Set<Long> partnerIds = new HashSet<>();
                partnerIds.addAll(chatMessageRepository.findPartnerIdsWhereUserIsSender(userId));
                partnerIds.addAll(chatMessageRepository.findPartnerIdsWhereUserIsRecipient(userId));

                List<Users> partners = userRepository.findAllById(partnerIds);

                return partners.stream().map(partner -> {
                    // Count unread messages from this partner to the current user
                    List<ChatMessage> unread = chatMessageRepository.findUnreadMessages(partner.getId(), userId);
                    
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", partner.getId());
                    map.put("name", partner.getName() != null ? partner.getName() : "Unknown");
                    map.put("email", partner.getEmail() != null ? partner.getEmail() : "");
                    map.put("avatar", partner.getAvatar() != null ? partner.getAvatar() : "");
                    map.put("unreadCount", unread.size());
                    return map;
                }).collect(Collectors.toList());
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
