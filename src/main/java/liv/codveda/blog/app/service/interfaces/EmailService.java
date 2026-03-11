package liv.codveda.blog.app.service.interfaces;

public interface EmailService {
    void sendPasswordResetEmail(String to, String resetLink);
}
