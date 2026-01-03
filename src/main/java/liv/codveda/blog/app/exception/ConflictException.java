package liv.codveda.blog.app.exception;

import org.springframework.http.HttpStatus;

public class ConflictException extends RuntimeException {
    public ConflictException(HttpStatus conflict, String message) {
        super(message);
    }
}
