package liv.codveda.blog.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.request.ForgotPasswordRequest;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import liv.codveda.blog.app.domain.dto.request.ResetPasswordRequest;
import liv.codveda.blog.app.domain.dto.response.BlogResponse;
import liv.codveda.blog.app.security.util.CookieUtils;
import liv.codveda.blog.app.service.interfaces.AuthenticationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller responsible for all authentication operations including
 * user registration, login, token refresh, logout, and password recovery.
 */
@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping(value = "/api/v1/auth")
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final CookieUtils cookieUtils;

    /**
     * Register a new user account.
     */
    @PostMapping("/signup")
    public ResponseEntity<?> register(
            @RequestBody @Valid Register request,
            HttpServletResponse response) {
        log.info("Registration request for email: {}", request.getEmail());
        return authenticationService.register(request, response);
    }

    /**
     * Register a new admin account. Requires ADMIN role.
     */
    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerAdmin(
            @RequestBody @Valid Register request,
            HttpServletResponse response) {
        log.info("Admin registration request for email: {}", request.getEmail());
        return authenticationService.registerAdmin(request, response);
    }

    /**
     * Authenticate a user with email and password credentials.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody @Valid Login request,
            HttpServletResponse response) {
        log.info("Login attempt for email: {}", request.email());
        return authenticationService.authenticate(request, response);
    }

    /**
     * Refresh the access token using the refresh token cookie.
     */
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        log.debug("Token refresh request received");
        return authenticationService.refreshToken(request, response);
    }

    /**
     * Logout the current user by invalidating the refresh token and clearing cookies.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        log.info("Logout request received");
        // Clear auth cookies directly
        cookieUtils.deleteCookie(response, "accessToken");
        cookieUtils.deleteCookie(response, "refreshToken");
        // Delegate backend cleanup (token invalidation) to the service
        try {
            authenticationService.logout(request, response);
        } catch (Exception e) {
            log.debug("Service-level logout cleanup skipped: {}", e.getMessage());
        }
        return ResponseEntity.ok(BlogResponse.builder()
                .message("Logout successful")
                .build());
    }

    /**
     * Initiate the forgot-password flow by sending a reset link to the user's email.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        log.info("Forgot-password request for email: {}", request.getEmail());
        return authenticationService.forgotPassword(request);
    }

    /**
     * Reset a user's password using a valid reset token.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        log.info("Password reset request received");
        return authenticationService.resetPassword(request);
    }
}
