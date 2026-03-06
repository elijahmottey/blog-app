package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.request.ChatMessageRequest;
import liv.codveda.blog.app.domain.dto.response.ChatMessageResponse;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    // Fetch conversation history between current user and a target user
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
            @PathVariable Long userId,
            @AuthenticationPrincipal Users currentUser) {
        
        log.info("Fetching chat history between user {} and user {}", currentUser.getId(), userId);
        List<ChatMessageResponse> history = chatService.getChatHistory(currentUser.getId(), userId);
        return ResponseEntity.ok(history);
    }

    // WebSocket endpoint to receive messages
    // The client sends to "/app/chat"
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageRequest chatMessage, @AuthenticationPrincipal Users currentUser) {
        log.info("Received WebSocket chat message from user {} to user {}", currentUser.getId(), chatMessage.getRecipientId());
        chatService.processMessage(currentUser.getId(), chatMessage);
    }
}
