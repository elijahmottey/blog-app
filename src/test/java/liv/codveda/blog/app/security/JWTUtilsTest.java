package liv.codveda.blog.app.security;

import io.jsonwebtoken.security.SignatureException;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.security.jwt.JWTUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Comprehensive unit tests for {@link JWTUtils}.
 * Validates token generation, extraction, validation, and security boundaries
 * including key separation between access and refresh tokens.
 */
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

    // ── Token Generation ────────────────────────────────────────────────────

    @Nested
    @DisplayName("Token Generation")
    class TokenGenerationTests {

        @Test
        @DisplayName("should generate a non-empty access token")
        void generateAccessToken() {
            String token = jwtUtils.generateAccessToken(userDetails);

            assertNotNull(token);
            assertFalse(token.isEmpty());
        }

        @Test
        @DisplayName("should generate a non-empty refresh token")
        void generateRefreshToken() {
            String token = jwtUtils.generateRefreshToken(userDetails);

            assertNotNull(token);
            assertFalse(token.isEmpty());
        }

        @Test
        @DisplayName("access and refresh tokens should be different")
        void tokensAreDifferent() {
            String access = jwtUtils.generateAccessToken(userDetails);
            String refresh = jwtUtils.generateRefreshToken(userDetails);

            assertNotEquals(access, refresh);
        }
    }

    // ── Claim Extraction ────────────────────────────────────────────────────

    @Nested
    @DisplayName("Claim Extraction")
    class ClaimExtractionTests {

        @Test
        @DisplayName("should extract username from access token")
        void extractUsername() {
            String token = jwtUtils.generateAccessToken(userDetails);
            assertEquals("test@example.com", jwtUtils.extractUsername(token));
        }

        @Test
        @DisplayName("should extract ACCESS token type from access token")
        void extractTokenType_Access() {
            String token = jwtUtils.generateAccessToken(userDetails);
            assertEquals("ACCESS", jwtUtils.extractTokenType(token));
        }

        @Test
        @DisplayName("should extract authorities containing ROLE_USER")
        void extractAuthorities() {
            String token = jwtUtils.generateAccessToken(userDetails);
            List<String> authorities = jwtUtils.extractAuthorities(token);

            assertNotNull(authorities);
            assertTrue(authorities.contains("ROLE_USER"));
        }

        @Test
        @DisplayName("should extract expiration in the future")
        void extractExpiration_AccessToken() {
            String token = jwtUtils.generateAccessToken(userDetails);
            Instant expiration = jwtUtils.extractExpiration(token);

            assertNotNull(expiration);
            assertTrue(expiration.isAfter(Instant.now()));
        }

        @Test
        @DisplayName("should extract expiration from refresh token")
        void extractExpiration_RefreshToken() {
            String token = jwtUtils.generateRefreshToken(userDetails);
            Instant expiration = jwtUtils.extractExpiration(token);

            assertNotNull(expiration);
            assertTrue(expiration.isAfter(Instant.now()));
        }
    }

    // ── Token Validation ────────────────────────────────────────────────────

    @Nested
    @DisplayName("Token Validation")
    class TokenValidationTests {

        @Test
        @DisplayName("should validate a valid access token")
        void validAccessToken() {
            String token = jwtUtils.generateAccessToken(userDetails);
            assertTrue(jwtUtils.isValidAccessToken(token, userDetails));
        }

        @Test
        @DisplayName("should validate a valid refresh token")
        void validRefreshToken() {
            String token = jwtUtils.generateRefreshToken(userDetails);
            assertTrue(jwtUtils.isValidRefreshToken(token, userDetails));
        }

        @Test
        @DisplayName("should reject access token when validated as refresh token (different key)")
        void accessTokenNotValidAsRefreshToken() {
            String accessToken = jwtUtils.generateAccessToken(userDetails);
            assertFalse(jwtUtils.isValidRefreshToken(accessToken, userDetails));
        }

        @Test
        @DisplayName("should reject refresh token when validated as access token (different key)")
        void refreshTokenNotValidAsAccessToken() {
            String refreshToken = jwtUtils.generateRefreshToken(userDetails);
            assertFalse(jwtUtils.isValidAccessToken(refreshToken, userDetails));
        }

        @Test
        @DisplayName("should reject token with wrong user")
        void tokenInvalidForDifferentUser() {
            String token = jwtUtils.generateAccessToken(userDetails);
            Users otherUser = Users.builder()
                    .id(2L).name("Other").email("other@example.com")
                    .password("pw").role(Roles.USER).build();

            assertFalse(jwtUtils.isValidAccessToken(token, otherUser));
        }
    }

    // ── Key Separation (Security) ───────────────────────────────────────────

    @Nested
    @DisplayName("Key Separation Security")
    class KeySeparationTests {

        @Test
        @DisplayName("extractUsername should throw for a refresh token (signed with different key)")
        void extractUsername_ThrowsForRefreshToken() {
            String refreshToken = jwtUtils.generateRefreshToken(userDetails);
            // extractUsername uses the access key, so a refresh token should fail signature check
            assertThrows(SignatureException.class, () -> jwtUtils.extractUsername(refreshToken));
        }

        @Test
        @DisplayName("extractTokenType should throw for a refresh token (signed with different key)")
        void extractTokenType_ThrowsForRefreshToken() {
            String refreshToken = jwtUtils.generateRefreshToken(userDetails);
            assertThrows(SignatureException.class, () -> jwtUtils.extractTokenType(refreshToken));
        }
    }
}
