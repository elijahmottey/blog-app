package liv.codveda.blog.app.exception;

public record ErrorResponse(
        int status,
        String message,
        String details

) {
}
