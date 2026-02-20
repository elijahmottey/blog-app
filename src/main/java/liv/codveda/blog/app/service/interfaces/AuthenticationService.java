package liv.codveda.blog.app.service.interfaces;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import liv.codveda.blog.app.domain.dto.response.Token;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserDetails;

public interface AuthenticationService {
    ResponseEntity<?> authenticate(Login request, HttpServletResponse response);
    ResponseEntity<?> register(Register request, HttpServletResponse response);
    ResponseEntity<?> registerAdmin(Register request, HttpServletResponse response);
    ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response);
}
