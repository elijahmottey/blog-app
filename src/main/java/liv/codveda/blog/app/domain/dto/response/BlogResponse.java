package liv.codveda.blog.app.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import liv.codveda.blog.app.domain.enums.Roles;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
public class BlogResponse {
    private final String message;

    @JsonIgnore
    private final String accessToken;

    @JsonIgnore
    private final String refreshToken;
    @JsonIgnore
    private Instant accessTokenExpiration;
    @JsonIgnore
    private Instant refreshTokenExpiration;
    private  final Roles role;
    private final String name;
    @Builder.Default
    private final LocalDateTime timestamp = LocalDateTime.now();
    @Builder.Default
    private final String requestId = UUID.randomUUID().toString();


}
