package liv.codveda.blog.app.service;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import liv.codveda.blog.app.domain.dto.request.ForgotPasswordRequest;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import liv.codveda.blog.app.domain.dto.request.ResetPasswordRequest;
import liv.codveda.blog.app.domain.entities.PasswordResetToken;
import liv.codveda.blog.app.domain.entities.RefreshToken;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.exception.ConflictException;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.exception.UnauthorizedException;
import liv.codveda.blog.app.repository.PasswordResetTokenRepository;
import liv.codveda.blog.app.repository.RefreshTokenRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.security.jwt.JWTUtils;
import liv.codveda.blog.app.security.util.CookieUtils;
import liv.codveda.blog.app.service.impl.AuthenticationServiceImpl;
import liv.codveda.blog.app.service.interfaces.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

/**
 * Comprehensive unit tests for {@link AuthenticationServiceImpl}.
 * Covers registration, login, token refresh, logout, forgot-password and reset-password flows.
 */
@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock private UsersRepository usersRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JWTUtils jwtUtils;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private CookieUtils cookieUtils;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private EmailService emailService;
    @Mock private HttpServletResponse response;
    @Mock private HttpServletRequest request;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private Users testUser;
    private Register registerRequest;
    private Login loginRequest;

    @BeforeEach
    void setUp() {
        testUser = Users.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Roles.USER)
                .build();

        registerRequest = new Register();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Password123!");

        loginRequest = new Login("test@example.com", "Password123!");
    }

    // ── Helper: stub token generation ───────────────────────────────────────
    private void stubTokenGeneration() {
        when(jwtUtils.generateAccessToken(any())).thenReturn("accessToken");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtUtils.extractExpiration(anyString())).thenReturn(Instant.now().plusSeconds(3600));
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Registration
    // ════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("register()")
    class RegisterTests {

        @Test
        @DisplayName("should create user and return CREATED with tokens")
        void register_Success() {
            when(usersRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
            when(usersRepository.save(any(Users.class))).thenReturn(testUser);
            stubTokenGeneration();

            var result = authenticationService.register(registerRequest, response);

            assertEquals(HttpStatus.CREATED, result.getStatusCode());
            verify(usersRepository).save(any(Users.class));
            verify(refreshTokenRepository).save(any(RefreshToken.class));
            verify(cookieUtils).addCookie(any(), eq("accessToken"), anyString(), eq(3600));
            verify(cookieUtils).addCookie(any(), eq("refreshToken"), anyString(), eq(604800));
        }

        @Test
        @DisplayName("should throw ConflictException when email already exists")
        void register_EmailAlreadyExists() {
            when(usersRepository.existsByEmail(anyString())).thenReturn(true);

            assertThrows(ConflictException.class, () ->
                    authenticationService.register(registerRequest, response));
            verify(usersRepository, never()).save(any());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Login / Authenticate
    // ════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("authenticate()")
    class AuthenticateTests {

        @Test
        @DisplayName("should authenticate and return OK with tokens")
        void authenticate_Success() {
            when(authenticationManager.authenticate(any())).thenReturn(null);
            when(usersRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(refreshTokenRepository.findByUser(any())).thenReturn(Optional.empty());
            stubTokenGeneration();

            var result = authenticationService.authenticate(loginRequest, response);

            assertEquals(HttpStatus.OK, result.getStatusCode());
            verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
            verify(refreshTokenRepository).save(any(RefreshToken.class));
            verify(cookieUtils).addCookie(any(), eq("accessToken"), anyString(), eq(3600));
        }

        @Test
        @DisplayName("should throw NotFoundException when user not in database")
        void authenticate_UserNotFound() {
            when(authenticationManager.authenticate(any())).thenReturn(null);
            when(usersRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThrows(NotFoundException.class, () ->
                    authenticationService.authenticate(loginRequest, response));
        }

        @Test
        @DisplayName("should propagate BadCredentialsException for wrong password")
        void authenticate_BadCredentials() {
            when(authenticationManager.authenticate(any()))
                    .thenThrow(new BadCredentialsException("Bad credentials"));

            assertThrows(BadCredentialsException.class, () ->
                    authenticationService.authenticate(loginRequest, response));
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Register Admin
    // ════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("registerAdmin()")
    class RegisterAdminTests {

        @Test
        @DisplayName("should create admin user and return CREATED")
        void registerAdmin_Success() {
            Users adminUser = Users.builder()
                    .id(2L).name("Test User").email("test@example.com")
                    .password("encodedPassword").role(Roles.ADMIN).build();

            when(usersRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
            when(usersRepository.save(any(Users.class))).thenReturn(adminUser);
            stubTokenGeneration();

            var result = authenticationService.registerAdmin(registerRequest, response);

            assertEquals(HttpStatus.CREATED, result.getStatusCode());
            verify(usersRepository).save(any(Users.class));
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Refresh Token
    // ════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("refreshToken()")
    class RefreshTokenTests {

        @Test
        @DisplayName("should issue new token pair and return OK")
        void refreshToken_Success() {
            RefreshToken dbToken = RefreshToken.builder()
                    .id(1L).user(testUser).token("oldRefresh")
                    .expiryDate(Instant.now().plusSeconds(86400)).build();

            when(cookieUtils.getCookie(any(), eq("refreshToken"))).thenReturn(Optional.of("oldRefresh"));
            when(refreshTokenRepository.findByToken("oldRefresh")).thenReturn(Optional.of(dbToken));
            when(jwtUtils.extractUsername("oldRefresh")).thenReturn("test@example.com");
            when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
            when(jwtUtils.isValidRefreshToken("oldRefresh", testUser)).thenReturn(true);
            stubTokenGeneration();

            var result = authenticationService.refreshToken(request, response);

            assertEquals(HttpStatus.OK, result.getStatusCode());
            verify(refreshTokenRepository).save(any(RefreshToken.class));
            verify(cookieUtils).addCookie(any(), eq("accessToken"), anyString(), eq(3600));
            verify(cookieUtils).addCookie(any(), eq("refreshToken"), anyString(), eq(604800));
        }

        @Test
        @DisplayName("should throw when no refresh cookie is present")
        void refreshToken_NoCookie() {
            when(cookieUtils.getCookie(any(), eq("refreshToken"))).thenReturn(Optional.empty());

            assertThrows(UnauthorizedException.class, () ->
                    authenticationService.refreshToken(request, response));
        }

        @Test
        @DisplayName("should throw when token is expired")
        void refreshToken_Expired() {
            RefreshToken expiredToken = RefreshToken.builder()
                    .id(1L).user(testUser).token("expired")
                    .expiryDate(Instant.now().minusSeconds(60)).build();

            when(cookieUtils.getCookie(any(), eq("refreshToken"))).thenReturn(Optional.of("expired"));
            when(refreshTokenRepository.findByToken("expired")).thenReturn(Optional.of(expiredToken));

            assertThrows(UnauthorizedException.class, () ->
                    authenticationService.refreshToken(request, response));
            verify(refreshTokenRepository).delete(expiredToken);
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Logout
    // ════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("logout()")
    class LogoutTests {

        @Test
        @DisplayName("should delete refresh token and clear cookies")
        void logout_Success() {
            RefreshToken rt = RefreshToken.builder().id(1L).token("rt").user(testUser).build();
            when(cookieUtils.getCookie(any(), eq("refreshToken"))).thenReturn(Optional.of("rt"));
            when(refreshTokenRepository.findByToken("rt")).thenReturn(Optional.of(rt));

            var result = authenticationService.logout(request, response);

            assertEquals(HttpStatus.OK, result.getStatusCode());
            verify(refreshTokenRepository).delete(rt);
            verify(cookieUtils).deleteCookie(response, "accessToken");
            verify(cookieUtils).deleteCookie(response, "refreshToken");
        }

        @Test
        @DisplayName("should still clear cookies even if no refresh token cookie exists")
        void logout_NoRefreshCookie() {
            when(cookieUtils.getCookie(any(), eq("refreshToken"))).thenReturn(Optional.empty());

            var result = authenticationService.logout(request, response);

            assertEquals(HttpStatus.OK, result.getStatusCode());
            verify(refreshTokenRepository, never()).delete(any(RefreshToken.class));
            verify(cookieUtils).deleteCookie(response, "accessToken");
            verify(cookieUtils).deleteCookie(response, "refreshToken");
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Forgot Password
    // ════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("forgotPassword()")
    class ForgotPasswordTests {

        @Test
        @DisplayName("should send reset email when user exists")
        void forgotPassword_UserExists() {
            ForgotPasswordRequest req = new ForgotPasswordRequest();
            req.setEmail("test@example.com");

            when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            var result = authenticationService.forgotPassword(req);

            assertEquals(HttpStatus.OK, result.getStatusCode());
            verify(passwordResetTokenRepository).deleteByUser(testUser);
            verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
            verify(emailService).sendPasswordResetEmail(eq("test@example.com"), anyString());
        }

        @Test
        @DisplayName("should return OK even when user does not exist (prevents enumeration)")
        void forgotPassword_UserNotFound() {
            ForgotPasswordRequest req = new ForgotPasswordRequest();
            req.setEmail("unknown@example.com");

            when(usersRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

            var result = authenticationService.forgotPassword(req);

            assertEquals(HttpStatus.OK, result.getStatusCode());
            verify(passwordResetTokenRepository, never()).save(any());
            verify(emailService, never()).sendPasswordResetEmail(anyString(), anyString());
        }
    }

    // ════════════════════════════════════════════════════════════════════════
    //  Reset Password
    // ════════════════════════════════════════════════════════════════════════

    @Nested
    @DisplayName("resetPassword()")
    class ResetPasswordTests {

        @Test
        @DisplayName("should reset password and invalidate sessions")
        void resetPassword_Success() {
            ResetPasswordRequest req = new ResetPasswordRequest();
            req.setToken("valid-token");
            req.setNewPassword("NewP@ss123");

            PasswordResetToken prt = PasswordResetToken.builder()
                    .id(1L).token("valid-token").user(testUser)
                    .expiryDate(LocalDateTime.now().plusMinutes(30)).build();

            when(passwordResetTokenRepository.findByToken("valid-token")).thenReturn(Optional.of(prt));
            when(passwordEncoder.encode("NewP@ss123")).thenReturn("newEncoded");

            var result = authenticationService.resetPassword(req);

            assertEquals(HttpStatus.OK, result.getStatusCode());
            verify(usersRepository).save(testUser);
            verify(passwordResetTokenRepository).delete(prt);
            verify(refreshTokenRepository).deleteByUser(testUser);
        }

        @Test
        @DisplayName("should throw when token is invalid")
        void resetPassword_InvalidToken() {
            ResetPasswordRequest req = new ResetPasswordRequest();
            req.setToken("bad-token");
            req.setNewPassword("NewP@ss123");

            when(passwordResetTokenRepository.findByToken("bad-token")).thenReturn(Optional.empty());

            assertThrows(UnauthorizedException.class, () ->
                    authenticationService.resetPassword(req));
        }

        @Test
        @DisplayName("should throw when token is expired")
        void resetPassword_ExpiredToken() {
            ResetPasswordRequest req = new ResetPasswordRequest();
            req.setToken("expired-token");
            req.setNewPassword("NewP@ss123");

            PasswordResetToken expired = PasswordResetToken.builder()
                    .id(1L).token("expired-token").user(testUser)
                    .expiryDate(LocalDateTime.now().minusMinutes(10)).build();

            when(passwordResetTokenRepository.findByToken("expired-token")).thenReturn(Optional.of(expired));

            assertThrows(UnauthorizedException.class, () ->
                    authenticationService.resetPassword(req));
            verify(passwordResetTokenRepository).delete(expired);
        }
    }
}
