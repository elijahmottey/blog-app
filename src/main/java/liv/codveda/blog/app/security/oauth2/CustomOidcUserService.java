package liv.codveda.blog.app.security.oauth2;

import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomOidcUserService extends OidcUserService {

    private final UsersRepository usersRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        String registrationId = userRequest.getClientRegistration().getRegistrationId();
        log.info("OIDC login attempt with provider: {}", registrationId);
        log.info("OIDC user attributes: {}", oidcUser.getAttributes());

        String email = oidcUser.getEmail();
        String name = oidcUser.getFullName() != null ? oidcUser.getFullName() : oidcUser.getGivenName();
        String avatar = oidcUser.getPicture();

        log.info("Extracted - Email: {}, Name: {}, Avatar: {}", email, name, avatar);

        Users user = usersRepository.findByEmail(email)
                .orElseGet(() -> createNewUser(email, name, avatar, registrationId, oidcUser.getSubject()));

        return new OAuth2UserPrincipal(user, oidcUser.getAttributes(), oidcUser.getIdToken(), oidcUser.getUserInfo());
    }

    private Users createNewUser(String email, String name, String avatar, String provider, String providerId) {
        log.info("Creating new OIDC user with email: {}", email);
        Users newUser = Users.builder()
                .email(email)
                .name(name != null && !name.trim().isEmpty() ? name : "OIDC User")
                .avatar(avatar)
                .password(null)
                .provider(provider.toUpperCase())
                .providerId(providerId)
                .role(Roles.USER)
                .build();

        return usersRepository.save(newUser);
    }
}