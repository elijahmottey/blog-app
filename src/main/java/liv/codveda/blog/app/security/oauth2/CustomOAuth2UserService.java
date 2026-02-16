package liv.codveda.blog.app.security.oauth2;

import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UsersRepository usersRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        log.info("OAuth2 login attempt with provider: {}", registrationId);
        log.info("OAuth2 user attributes: {}", oAuth2User.getAttributes());
        
        String email = getEmail(oAuth2User, registrationId);
        String name = getName(oAuth2User, registrationId);
        String avatar = getAvatar(oAuth2User, registrationId);
        
        log.info("Extracted - Email: {}, Name: {}, Avatar: {}", email, name, avatar);
        
        Users user = usersRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, name, avatar, registrationId, oAuth2User.getName()));

        return new OAuth2UserPrincipal(user, oAuth2User.getAttributes());
    }

    private String getEmail(OAuth2User oAuth2User, String registrationId) {
        String email = null;
        if ("github".equals(registrationId)) {
            email = oAuth2User.getAttribute("email");
            if (email == null || email.trim().isEmpty()) {
                String login = oAuth2User.getAttribute("login");
                email = login + "@github.local";
                log.warn("GitHub email is null/empty, using fallback: {}", email);
            }
        } else {
            email = oAuth2User.getAttribute("email");
        }
        return email;
    }

    private String getName(OAuth2User oAuth2User, String registrationId) {
        if ("github".equals(registrationId)) {
            String name = oAuth2User.getAttribute("name");
            return name != null && !name.trim().isEmpty() ? name : oAuth2User.getAttribute("login");
        }
        return oAuth2User.getAttribute("name");
    }

    private String getAvatar(OAuth2User oAuth2User, String registrationId) {
        if ("github".equals(registrationId)) {
            return oAuth2User.getAttribute("avatar_url");
        }
        return oAuth2User.getAttribute("picture");
    }

    private Users createNewUser(String email, String name, String avatar, String provider, String providerId) {
        log.info("Creating new OAuth2 user with email: {}", email);
        Users newUser = Users.builder()
                .email(email)
                .name(name != null && !name.trim().isEmpty() ? name : "OAuth2 User")
                .avatar(avatar)
                .password(null)
                .provider(provider.toUpperCase())
                .providerId(providerId)
                .role(Roles.USER) // Always USER for OAuth2 users
                .build();
        
        return usersRepository.save(newUser);
    }
}