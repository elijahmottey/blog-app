package liv.codveda.blog.app.service.interfaces;

import jakarta.servlet.http.HttpServletRequest;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import org.springframework.http.ResponseEntity;

public interface AuthenticationService {
    ResponseEntity<?> authenticate(Login request);
    ResponseEntity<?> register(Register request);
    ResponseEntity<?> registerAdmin(Register request);
    void logout(HttpServletRequest request);

}
