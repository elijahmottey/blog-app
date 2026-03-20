package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.request.ChatMessageRequest;
import liv.codveda.blog.app.domain.dto.response.ChatMessageResponse;
import liv.codveda.blog.app.domain.entities.ChatMessage;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.repository.ChatMessageRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    private  ChatMessageRepository chatMessageRepository;

    @Mock
    private UsersRepository userRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private ChatService chatService;

    private Users sender;
    private Users recipient;
    private ChatMessage message;

    @BeforeEach
    void setUp() {
        sender = Users.builder().id(1L).name("Sender").email("sender@test.com").build();
        recipient = Users.builder().id(2L).name("Recipient").email("recipient@test.com").build();

        message = ChatMessage.builder()
                .id(100L)
                .sender(sender)
                .recipient(recipient)
                .content("Hello")
                .postId(10L)
                .isRead(false)
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Test
    void processMessage_Success() {
        // Arrange
        ChatMessageRequest request = new ChatMessageRequest(2L, "Hello", 10L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(chatMessageRepository.save(any(ChatMessage.class))).thenReturn(message);

        // Act
        ChatMessageResponse response = chatService.processMessage(1L, request);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals("Hello", response.getContent());
        assertEquals(1L, response.getSenderId());
        assertEquals(2L, response.getRecipientId());

        verify(chatMessageRepository, times(1)).save(any(ChatMessage.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/messages/2"), any(ChatMessageResponse.class));
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/messages/1"), any(ChatMessageResponse.class));
    }

    @Test
    void processMessage_SenderNull_ThrowsException() {
        ChatMessageRequest request = new ChatMessageRequest(2L, "Hello", null);

        assertThrows(IllegalArgumentException.class, () -> chatService.processMessage(null, request));
        verifyNoInteractions(chatMessageRepository);
    }

    @Test
    void processMessage_RecipientNotFound_ThrowsException() {
        ChatMessageRequest request = new ChatMessageRequest(99L, "Hello", null);
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> chatService.processMessage(1L, request));
        verifyNoInteractions(chatMessageRepository);
    }

    @Test
    void markMessagesAsRead_Success() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient)); // reader
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender)); // sender
        when(chatMessageRepository.findUnreadMessages(1L, 2L)).thenReturn(List.of(message));

        // Act
        chatService.markMessagesAsRead(2L, 1L);

        // Assert
        assertTrue(message.isRead());
        verify(chatMessageRepository, times(1)).saveAll(anyList());
        verify(messagingTemplate, times(1)).convertAndSend(eq("/topic/messages/1"), any(Object.class));
    }

    @Test
    void markMessagesAsRead_NoUnreadMessages() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(recipient));
        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));
        when(chatMessageRepository.findUnreadMessages(1L, 2L)).thenReturn(List.of());

        // Act
        chatService.markMessagesAsRead(2L, 1L);

        // Assert
        verify(chatMessageRepository, never()).saveAll(anyList());
        verify(messagingTemplate, never()).convertAndSend(anyString(), any(Object.class));
    }

    @Test
    void getChatHistory_Success() {
        // Arrange
        when(chatMessageRepository.findChatHistory(1L, 2L)).thenReturn(List.of(message));

        // Act
        List<ChatMessageResponse> history = chatService.getChatHistory(1L, 2L);

        // Assert
        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals("Hello", history.getFirst().getContent());
        assertEquals(1L, history.getFirst().getSenderId());
    }

    @Test
    void getConversations_Success() {
        // Arrange
        when(chatMessageRepository.findPartnerIdsWhereUserIsSender(1L)).thenReturn(List.of(2L));
        when(chatMessageRepository.findPartnerIdsWhereUserIsRecipient(1L)).thenReturn(List.of(3L));

        Users partner3 = Users.builder().id(3L).name("User3").build();
        when(userRepository.findAllById(anySet())).thenReturn(Arrays.asList(recipient, partner3));

        when(chatMessageRepository.findUnreadMessages(2L, 1L)).thenReturn(List.of(message));
        when(chatMessageRepository.findUnreadMessages(3L, 1L)).thenReturn(List.of());

        // Act
        List<Map<String, Object>> conversations = chatService.getConversations(1L);

        // Assert
        assertNotNull(conversations);
        assertEquals(2, conversations.size());

        // Find the conversation with recipient (ID=2)
        Map<String, Object> conv2 = conversations.stream().filter(c -> c.get("id").equals(2L)).findFirst().orElseThrow();
        assertEquals("Recipient", conv2.get("name"));
        assertEquals(1, conv2.get("unreadCount"));

        // Find the conversation with partner3 (ID=3)
        Map<String, Object> conv3 = conversations.stream().filter(c -> c.get("id").equals(3L)).findFirst().orElseThrow();
        assertEquals("User3", conv3.get("name"));
        assertEquals(0, conv3.get("unreadCount"));
    }
}