package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.service.interfaces.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailServiceImpl implements EmailService {

    @Override
    public void sendPasswordResetEmail(String to, String resetLink) {
        // Simulated email sending for development
        log.info("==========================================================");
        log.info("SIMULATED EMAIL SENT");
        log.info("To: {}", to);
        log.info("Subject: Password Reset Request");
        log.info("Body: Please click the link below to reset your password.");
        log.info("      {}", resetLink);
        log.info("==========================================================");
    }
}
