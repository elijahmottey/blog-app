package liv.codveda.blog.app.security.oauth2;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.entities.RefreshToken;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.RefreshTokenRepository;
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
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;

import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JWTUtils jwtUtils;
    private final UsersRepository usersRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CookieUtils cookieUtils;

    @Value("${frontend.url}")
    private String frontendUrl;

    @Override
    @Transactional
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null) {
            log.error("Email not found from OAuth2 provider. Cannot proceed with JWT generation.");
            getRedirectStrategy().sendRedirect(request, response, "/login?error=email_not_found");
            return;
        }

        // Ensure we have the fully loaded user from the database within this transaction
        Users user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("User not found after OAuth2 login: " + email));
        
        log.info("OAuth2 authentication success for user: {}", user.getEmail());
        
        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);

        // Update existing refresh token or create new one
        Optional<RefreshToken> existingToken = refreshTokenRepository.findByUser(user);
        RefreshToken rt;
        if (existingToken.isPresent()) {
            rt = existingToken.get();
            rt.setToken(refreshToken);
            rt.setExpiryDate(jwtUtils.extractExpiration(refreshToken));
        } else {
            rt = RefreshToken.builder()
                    .user(user)
                    .token(refreshToken)
                    .expiryDate(jwtUtils.extractExpiration(refreshToken))
                    .build();
        }
        refreshTokenRepository.save(rt);

        // Set tokens in cookies
        cookieUtils.addCookie(response, "accessToken", accessToken, 3600);
        cookieUtils.addCookie(response, "refreshToken", refreshToken, 604800);

        // Use configured frontend URL, fallback to localhost if property not set
        String targetUrl = (frontendUrl != null && !frontendUrl.isEmpty()) ? frontendUrl : "http://localhost:5173";
        String redirectUrl = targetUrl + "/oauth2/redirect";
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}