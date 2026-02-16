package liv.codveda.blog.app.security.oauth2;

import liv.codveda.blog.app.domain.entities.Users;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Map;

public class OAuth2UserPrincipal implements OAuth2User {
    
    @Getter
    private final Users user;
    private final Map<String, Object> attributes;

    public OAuth2UserPrincipal(Users user, Map<String, Object> attributes) {
        this.user = user;
        this.attributes = attributes;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return user.getAuthorities();
    }

    @Override
    public String getName() {
        return user.getName();
    }

}