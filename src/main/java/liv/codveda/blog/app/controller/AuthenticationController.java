package liv.codveda.blog.app.controller;

import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
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

    public AuthenticationController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> register(
            @RequestBody @Valid Register request
    ) {
        return authenticationService.register(request);
    }

    @PostMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> registerAdmin(
            @RequestBody @Valid Register request
    ) {
        return authenticationService.registerAdmin(request);
    }



    @PostMapping("login")
    public ResponseEntity<?> login(
            @RequestBody @Valid Login request
    ) {
        return authenticationService.authenticate(request);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        return ResponseEntity.ok().body(Map.of("message", "Logged out successfully"));
    }

}
