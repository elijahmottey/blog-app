package liv.codveda.blog.app.security.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.Arrays;
import java.util.Optional;

@Component
public class CookieUtils {

    @Value("${cookie.domain:localhost}")
    private String cookieDomain;

    @Value("${cookie.secure:false}")
    private boolean cookieSecure;

    public void addCookie(HttpServletResponse response, String name, String value, int maxAge) {
        // Use RequestAttributes to mark that we've set this cookie for the current request
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        String markerKey = "cookieSet:" + name;
        if (attrs != null && attrs.getAttribute(markerKey, RequestAttributes.SCOPE_REQUEST) != null) {
            // Cookie already set for this request - skip to avoid duplicate Set-Cookie headers
            return;
        }

        // Build and add a single Set-Cookie header using ResponseCookie so SameSite is included.
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(maxAge)
                .sameSite("Lax");
        if (!"localhost".equals(cookieDomain)) {
            builder.domain(cookieDomain);
        }
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());

        if (attrs != null) {
            attrs.setAttribute(markerKey, Boolean.TRUE, RequestAttributes.SCOPE_REQUEST);
        }
    }

    public Optional<String> getCookie(HttpServletRequest request, String name) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            return Arrays.stream(cookies)
                    .filter(cookie -> name.equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .findFirst();
        }
        return Optional.empty();
    }

    public void deleteCookie(HttpServletResponse response, String name) {
        RequestAttributes attrs = RequestContextHolder.getRequestAttributes();
        String markerKey = "cookieDeleted:" + name;
        if (attrs != null && attrs.getAttribute(markerKey, RequestAttributes.SCOPE_REQUEST) != null) {
            return;
        }

        // Use Set-Cookie header with maxAge=0 to instruct browser to delete the cookie.
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(0)
                .sameSite("Lax");
        if (!"localhost".equals(cookieDomain)) {
            builder.domain(cookieDomain);
        }
        response.addHeader(HttpHeaders.SET_COOKIE, builder.build().toString());

        if (attrs != null) {
            attrs.setAttribute(markerKey, Boolean.TRUE, RequestAttributes.SCOPE_REQUEST);
        }
    }
}
