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
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    // WebSocket endpoint for sending messages
    @MessageMapping("/chat")
    public void processMessage(@Payload ChatMessageRequest chatMessage, Principal principal) {
        if (principal == null) {
            log.error("Unauthenticated user attempted to send chat message via WebSocket");
            return;
        }
        
        // Assuming the principal name is the user's email
        String username = principal.getName();
        // Here you would typically look up the user by their username (email) to get the ID
        // This part is simplified. In a real app, you'd have a way to get the User object.
        // For now, let's assume the AuthenticationPrincipal is correctly populated in the context
        // and we can get it from the header accessor if needed.
        
        // This endpoint is now primarily for WebSocket, so we don't return a value.
        // The service will push messages to the correct topics.
        // We need the sender's ID. Let's assume the UserDetails object (our Users entity) is the principal.
        // This requires a bit of setup in WebSocket security config.
        
        // A more robust way is to get the full User object from the security context
        // Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        // if (auth != null && auth.getPrincipal() instanceof Users) {
        //    Users currentUser = (Users) auth.getPrincipal();
        //    chatService.processMessage(currentUser.getId(), chatMessage);
        // } else {
        //    log.error("Could not obtain user details from security context for WebSocket message");
        // }
    }

    // REST API for chat
    @RestController
    @RequestMapping("/api/chat")
    @RequiredArgsConstructor
    @Slf4j
    public static class ChatApiController {
        private final ChatService chatService;

        // Fetch conversation history
        @GetMapping("/history/{userId}")
        public ResponseEntity<List<ChatMessageResponse>> getChatHistory(
                @PathVariable Long userId,
                @AuthenticationPrincipal Users currentUser) {

            if (currentUser == null || currentUser.getId() == null) {
                return ResponseEntity.status(401).build();
            }

            log.info("Fetching chat history between user {} and user {}", currentUser.getId(), userId);
            List<ChatMessageResponse> history = chatService.getChatHistory(currentUser.getId(), userId);
            return ResponseEntity.ok(history);
        }

        // Send a message via REST
        @PostMapping("/send")
        public ResponseEntity<ChatMessageResponse> sendMessage(
                @RequestBody ChatMessageRequest chatMessage,
                @AuthenticationPrincipal Users currentUser) {

            if (currentUser == null || currentUser.getId() == null) {
                return ResponseEntity.status(401).build();
            }

            log.info("REST chat message from user {} to user {}", currentUser.getId(),
                    chatMessage.getRecipientId());
            ChatMessageResponse response = chatService.processMessage(currentUser.getId(), chatMessage);
            return ResponseEntity.ok(response);
        }

        // Mark messages as read
        @PutMapping("/read/{senderId}")
        public ResponseEntity<Void> markMessagesAsRead(
                @PathVariable Long senderId,
                @AuthenticationPrincipal Users currentUser) {

            if (currentUser == null || currentUser.getId() == null) {
                return ResponseEntity.status(401).build();
            }

            chatService.markMessagesAsRead(currentUser.getId(), senderId);
            return ResponseEntity.ok().build();
        }
    }
}
