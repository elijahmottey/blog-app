package liv.codveda.blog.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import liv.codveda.blog.app.domain.dto.request.ForgotPasswordRequest;
import liv.codveda.blog.app.domain.dto.request.ResetPasswordRequest;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.security.util.CookieUtils;
import liv.codveda.blog.app.service.interfaces.AuthenticationService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping(value = "/api/v1/auth")
public class AuthenticationController {
    private final AuthenticationService authenticationService;
    private final CookieUtils cookieUtils;


    public AuthenticationController(AuthenticationService authenticationService, CookieUtils cookieUtils) {
        this.authenticationService = authenticationService;
        this.cookieUtils = cookieUtils;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(
            @RequestBody @Valid Register request,
            HttpServletResponse response) {
        return authenticationService.register(request, response);
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerAdmin(
            @RequestBody @Valid Register request,
            HttpServletResponse response) {
        return authenticationService.registerAdmin(request, response);
    }

    @PostMapping("login")
    public ResponseEntity<?> login(
            @RequestBody @Valid Login request,
            HttpServletResponse response) {
        return authenticationService.authenticate(request, response);
    }

//    @PostMapping("/logout")
//    public ResponseEntity<ApiResponse<String>> logout(HttpServletResponse response) {
//        cookiesService.clearTokenCookies(response);
//        return ResponseEntity.ok(new ApiResponse<>(null, "Logout successful"));
//    }
//
//    @PostMapping("/refresh")
//    public ResponseEntity<ApiResponse<AuthResponse>> refresh(HttpServletRequest request, HttpServletResponse response) {
//        String refreshToken = cookiesService.extractTokenFromCookie(request, "refreshToken");
//        if (refreshToken == null) {
//            log.warn("No refresh token cookie found on refresh request");
//            return ResponseEntity.badRequest().body(new ApiResponse<>(null, "Missing refresh token cookie"));
//        }
//
//        LoginResult result = authService.refreshToken(refreshToken);
//        cookiesService.addTokenCookies(response, result.accessToken(), result.refreshToken());
//        return ResponseEntity.ok(new ApiResponse<>(result.response(), "Token refreshed"));
//    }

    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        return authenticationService.refreshToken(request, response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        return authenticationService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
        return authenticationService.resetPassword(request);
    }
}
