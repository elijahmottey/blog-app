package liv.codveda.blog.app.domain.dto.reference;

import liv.codveda.blog.app.domain.enums.Roles;

public record UsersReferenceDto(
        Long id,
        String name,
        String email,
        Roles role

) {
}
