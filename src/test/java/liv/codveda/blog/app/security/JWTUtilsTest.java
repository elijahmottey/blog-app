package liv.codveda.blog.app.security;

import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.security.jwt.JWTUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.Instant;

import static org.junit.jupiter.api.Assertions.*;

class JWTUtilsTest {

    private JWTUtils jwtUtils;
    private UserDetails userDetails;

    @BeforeEach
    void setUp() {
        jwtUtils = new JWTUtils(
                "testSecretKeyThatIsLongEnoughForHS256Algorithm",
                "testRefreshSecretKeyThatIsLongEnoughForHS256"
        );

        Users user = Users.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("password")
                .role(Roles.USER)
                .build();

        userDetails = user;
    }

    @Test
    void testGenerateAccessToken() {
        String token = jwtUtils.generateAccessToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testGenerateRefreshToken() {
        String token = jwtUtils.generateRefreshToken(userDetails);

        assertNotNull(token);
        assertFalse(token.isEmpty());
    }

    @Test
    void testExtractUsername() {
        String token = jwtUtils.generateAccessToken(userDetails);
        String username = jwtUtils.extractUsername(token);

        assertEquals("test@example.com", username);
    }

    @Test
    void testExtractTokenType() {
        String accessToken = jwtUtils.generateAccessToken(userDetails);
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        assertEquals("ACCESS", jwtUtils.extractTokenType(accessToken));
        assertEquals("REFRESH", jwtUtils.extractTokenType(refreshToken));
    }

    @Test
    void testIsValidAccessToken() {
        String token = jwtUtils.generateAccessToken(userDetails);

        assertTrue(jwtUtils.isValidAccessToken(token, userDetails));
    }

    @Test
    void testIsValidRefreshToken() {
        String token = jwtUtils.generateRefreshToken(userDetails);

        assertTrue(jwtUtils.isValidRefreshToken(token, userDetails));
    }

    @Test
    void testAccessTokenNotValidAsRefreshToken() {
        String accessToken = jwtUtils.generateAccessToken(userDetails);

        assertFalse(jwtUtils.isValidRefreshToken(accessToken, userDetails));
    }

    @Test
    void testRefreshTokenNotValidAsAccessToken() {
        String refreshToken = jwtUtils.generateRefreshToken(userDetails);

        assertFalse(jwtUtils.isValidAccessToken(refreshToken, userDetails));
    }

    @Test
    void testExtractExpiration() {
        String token = jwtUtils.generateAccessToken(userDetails);
        Instant expiration = jwtUtils.extractExpiration(token);

        assertNotNull(expiration);
        assertTrue(expiration.isAfter(Instant.now()));
    }

    @Test
    void testExtractAuthorities() {
        String token = jwtUtils.generateAccessToken(userDetails);
        var authorities = jwtUtils.extractAuthorities(token);

        assertNotNull(authorities);
        assertTrue(authorities.contains("ROLE_USER"));
    }
}
