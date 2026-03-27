package liv.codveda.blog.app.security.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.Arrays;
import java.util.Optional;

/**
 * Utility component for managing HTTP cookies in a secure, production-ready manner.
 * <p>
 * All cookie operations use {@code Set-Cookie} response headers via {@link ResponseCookie}
 * to ensure proper {@code SameSite}, {@code HttpOnly}, and {@code Secure} attribute support.
 * A request-scoped deduplication mechanism prevents duplicate {@code Set-Cookie} headers
 * from being emitted within the same HTTP request cycle.
 * </p>
 */
@Slf4j
@Component
public class CookieUtils {

    @Value("${cookie.domain:localhost}")
    private String cookieDomain;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    /**
     * Adds a cookie to the HTTP response with the specified name, value, and max-age.
     * <p>
     * The cookie is set as {@code HttpOnly} with {@code SameSite=Lax} by default.
     * If the configured domain is not {@code localhost}, the domain attribute is applied.
     * Duplicate cookies within the same request are automatically prevented.
     * </p>
     *
     * @param response the HTTP response to add the cookie to
     * @param name     the cookie name
     * @param value    the cookie value
     * @param maxAge   the cookie's max-age in seconds
     */
    public void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        if (isDuplicate("cookieSet:" + name)) {
            log.debug("Cookie '{}' already set in this request — skipping duplicate", name);
            return;
        }

        ResponseCookie cookie = buildCookie(name, value, maxAge);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        markAsProcessed("cookieSet:" + name);

        log.debug("Cookie '{}' added (maxAge={}s, secure={}, domain={})",
                name, maxAge, cookieSecure, cookieDomain);
    }

    /**
     * Retrieves a cookie value from the incoming HTTP request by name.
     *
     * @param request the HTTP request to extract the cookie from
     * @param name    the cookie name to look up
     * @return an {@link Optional} containing the cookie value, or empty if not found
     */
    public Optional<String> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            log.debug("No cookies present in request while looking for '{}'", name);
            return Optional.empty();
        }

        Optional<String> result = Arrays.stream(cookies)
                .filter(cookie -> name.equals(cookie.getName()))
                .map(Cookie::getValue)
                .findFirst();

        log.debug("Cookie '{}' {} in request", name, result.isPresent() ? "found" : "not found");
        return result;
    }

    /**
     * Deletes a cookie by setting its max-age to 0 and its value to empty.
     *
     * @param response the HTTP response
     * @param name     the cookie name to delete
     */
    public void deleteCookie(HttpServletResponse response, String name) {
        if (isDuplicate("cookieDeleted:" + name)) {
            log.debug("Cookie '{}' already deleted in this request — skipping duplicate", name);
            return;
        }

        ResponseCookie cookie = buildCookie(name, "", 0);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
        markAsProcessed("cookieDeleted:" + name);

        log.debug("Cookie '{}' deleted (domain={})", name, cookieDomain);
    }

    /**
     * Convenience method to delete all authentication-related cookies (access and refresh tokens).
     *
     * @param response the HTTP response
     */
    public void deleteAllAuthCookies(HttpServletResponse response) {
        deleteCookie(response, "accessToken");
        deleteCookie(response, "refreshToken");
        log.debug("All authentication cookies cleared");
    }

    // ── Internal helpers ────────────────────────────────────────────────────

    private ResponseCookie buildCookie(String name, String value, int maxAge) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax");

        if (!"localhost".equals(cookieDomain)) {
            builder.domain(cookieDomain);
        }

        return builder.build();
    }

    private boolean isDuplicate(String markerKey) {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        return attrs != null && attrs.getAttribute(markerKey, RequestAttributes.SCOPE_REQUEST) != null;
    }

    private void markAsProcessed(String markerKey) {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        if (attrs != null) {
            attrs.setAttribute(markerKey, Boolean.TRUE, RequestAttributes.SCOPE_REQUEST);
        }
    }
}
