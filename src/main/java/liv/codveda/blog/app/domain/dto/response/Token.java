package liv.codveda.blog.app.domain.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;


@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Token {
    @JsonIgnore
    private String accessToken;
    @JsonIgnore
    private String refreshToken;
    @JsonIgnore
    private Instant accessTokenExpiration;
    @JsonIgnore
    private Instant refreshTokenExpiration;
}
