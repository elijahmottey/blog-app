package liv.codveda.blog.app.config;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import liv.codveda.blog.app.security.jwt.JWTUtils;
import liv.codveda.blog.app.service.CustomUserDetailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
@Slf4j
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JWTUtils jwtUtils;
    private final CustomUserDetailService customUserDetailService;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
                        if (request instanceof ServletServerHttpRequest) {
                            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
                            HttpServletRequest httpServletRequest = servletRequest.getServletRequest();
                            Cookie[] cookies = httpServletRequest.getCookies();
                            if (cookies != null) {
                                for (Cookie cookie : cookies) {
                                    if ("accessToken".equals(cookie.getName())) {
                                        attributes.put("accessToken", cookie.getValue());
                                        break;
                                    }
                                }
                            }
                        }
                        return true;
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception exception) {
                    }
                })
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                
                if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
                    List<String> authorization = accessor.getNativeHeader("Authorization");
                    String accessToken = null;
                    
                    if (authorization != null && !authorization.isEmpty()) {
                        String authHeader = authorization.getFirst();
                        if (authHeader.startsWith("Bearer ")) {
                            accessToken = authHeader.substring(7);
                        }
                    }

                    // Fallback to cookie if header is not present
                    if (accessToken == null) {
                        Map<String, Object> sessionAttributes = accessor.getSessionAttributes();
                        if (sessionAttributes != null && sessionAttributes.containsKey("accessToken")) {
                            accessToken = (String) sessionAttributes.get("accessToken");
                        }
                    }

                    if (accessToken != null) {
                        try {
                            String username = jwtUtils.extractUsername(accessToken);
                            if (username != null) {
                                UserDetails userDetails = customUserDetailService.loadUserByUsername(username);
                                if (jwtUtils.isValidAccessToken(accessToken, userDetails)) {
                                    UsernamePasswordAuthenticationToken authentication = 
                                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                    accessor.setUser(authentication);
                                    // Important: set it in the security context so it propagates
                                    SecurityContextHolder.getContext().setAuthentication(authentication);
                                    log.info("WebSocket authenticated user: {}", username);
                                } else {
                                    log.warn("Invalid access token for WebSocket connection");
                                    // return null; // Let it pass for now to debug, but in prod we should return null
                                }
                            }
                        } catch (Exception e) {
                            log.error("WebSocket authentication failed: {}", e.getMessage());
                           // return null; 
                        }
                    } else {
                        log.warn("No access token provided for WebSocket connection");
                    }
                }
                return message;
            }
        });
    }
}
