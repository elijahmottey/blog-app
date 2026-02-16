package liv.codveda.blog.app.controller;

import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import liv.codveda.blog.app.security.util.CookieUtils;
import liv.codveda.blog.app.service.interfaces.AuthenticationService;
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
            HttpServletResponse response
    ) {
        return authenticationService.register(request, response);
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerAdmin(
            @RequestBody @Valid Register request,
            HttpServletResponse response
    ) {
        return authenticationService.registerAdmin(request, response);
    }



    @PostMapping("login")
    public ResponseEntity<?> login(
            @RequestBody @Valid Login request,
            HttpServletResponse response
    ) {
        return authenticationService.authenticate(request, response);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        cookieUtils.deleteCookie(response, "accessToken");
        cookieUtils.deleteCookie(response, "refreshToken");
        return ResponseEntity.ok().body(Map.of("message", "Logged out successfully"));
    }

}
