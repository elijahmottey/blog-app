package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.request.ChatMessageRequest;
import liv.codveda.blog.app.domain.dto.response.ChatMessageResponse;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.service.ChatService;
import liv.codveda.blog.app.service.impl.UserServiceImpl;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;
    private final UserServiceImpl userService;

    // WebSocket endpoint for sending messages
    @MessageMapping("/chat.send")
    public void processMessage(@Payload ChatMessageRequest chatMessage, Principal principal) {
        if (principal == null) {
            log.error("Unauthenticated user attempted to send chat message via WebSocket");
            return;
        }

        Long senderId = null;
        if (principal instanceof UsernamePasswordAuthenticationToken) {
            Object p = ((UsernamePasswordAuthenticationToken) principal).getPrincipal();
            if (p instanceof Users) {
                senderId = ((Users) p).getId();
            } else if (p instanceof String) {
                // If principal is just a username (email), fetch the user
                String email = (String) p;
                try {
                     senderId = userService.getUserByEmail(email).getId();
                } catch (Exception e) {
                    log.error("Could not find user for principal: {}", email);
                    return;
                }
            }
        }

        if (senderId == null) {
             try {
                 String email = principal.getName();
                 senderId = userService.getUserByEmail(email).getId();
             } catch (Exception e) {
                 log.error("Could not determine sender ID from principal: {}", principal);
                 return;
             }
        }

        log.info("WebSocket chat message from user {} to user {}", senderId, chatMessage.getRecipientId());
        chatService.processMessage(senderId, chatMessage);
    }
    
    // WebSocket endpoint for marking messages as read
    @MessageMapping("/chat.read")
    public void markAsRead(@Payload Long senderId, Principal principal) {
         if (principal == null) return;
         
         Long readerId = null;
         try {
             String email = principal.getName();
             readerId = userService.getUserByEmail(email).getId();
         } catch (Exception e) {
             log.error("Could not determine reader ID for read receipt");
             return;
         }
         
         chatService.markMessagesAsRead(readerId, senderId);
    }

    // REST API for chat history (Keep this for initial load)
    @GetMapping("/api/chat/history/{userId}")
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

    // REST API to get all conversations for the current user
    @GetMapping("/api/chat/conversations")
    public ResponseEntity<List<Map<String, Object>>> getConversations(@AuthenticationPrincipal Users currentUser) {
        if (currentUser == null || currentUser.getId() == null) {
            return ResponseEntity.status(401).build();
        }
        
        List<Map<String, Object>> conversations = chatService.getConversations(currentUser.getId());
        return ResponseEntity.ok(conversations);
    }
}
