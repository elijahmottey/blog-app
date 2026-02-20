package liv.codveda.blog.app.domain.dto.response;

// LoginResult should only carry the safe response payload. Tokens are set in HttpOnly cookies and must not be returned in JSON.
public record LoginResult(BlogResponse response) {}
