package liv.codveda.blog.app.domain.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Builder
public record Login(
        @NotNull(message = "email is required")
        String  email,
        @NotNull(message = "password is required")
        String password
) {
}

