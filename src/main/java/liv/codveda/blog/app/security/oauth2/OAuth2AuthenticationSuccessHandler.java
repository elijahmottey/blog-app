package liv.codveda.blog.app.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.security.jwt.JWTUtils;
import liv.codveda.blog.app.security.util.CookieUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTUtils jwtUtils;
    private final UsersRepository usersRepository;
    private final CookieUtils cookieUtils;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        
        Users user;
        if (oAuth2User instanceof OAuth2UserPrincipal) {
            user = ((OAuth2UserPrincipal) oAuth2User).getUser();
        } else {
            String email = oAuth2User.getAttribute("email");
            user = usersRepository.findByEmail(email)
                    .orElseGet(() -> {
                        Users newUser = Users.builder()
                                .email(email)
                                .name(oAuth2User.getAttribute("name"))
                                .avatar(oAuth2User.getAttribute("picture"))
                                .password(null)
                                .role(Roles.USER)
                                .build();
                        return usersRepository.save(newUser);
                    });
        }
        
        log.info("OAuth2 authentication success for user: {}", user.getEmail());
        
        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        // Set tokens in cookies
        cookieUtils.addCookie(response, "accessToken", accessToken, 3600);
        cookieUtils.addCookie(response, "refreshToken", refreshToken, 604800);

        String redirectUrl = frontendUrl + "/oauth2/redirect";
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}