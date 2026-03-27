package liv.codveda.blog.app.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import liv.codveda.blog.app.security.util.CookieUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * Tests for {@link CookieUtils}.
 * The implementation uses {@code response.addHeader("Set-Cookie", ...)} via {@link org.springframework.http.ResponseCookie},
 * NOT {@code response.addCookie(Cookie)}, so we capture the Set-Cookie header string.
 */
@ExtendWith(MockitoExtension.class)
class CookieUtilsTest {

    private CookieUtils cookieUtils;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @BeforeEach
    void setUp() {
        cookieUtils = new CookieUtils();
        ReflectionTestUtils.setField(cookieUtils, "cookieDomain", "localhost");
        ReflectionTestUtils.setField(cookieUtils, "cookieSecure", false);
    }

    // ── addCookie ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("addCookie()")
    class AddCookieTests {

        @Test
        @DisplayName("should add Set-Cookie header with correct attributes")
        void addCookie_SetsHeader() {
            cookieUtils.addCookie(response, "accessToken", "abc123", 3600);

            ArgumentCaptor<String> headerCaptor = ArgumentCaptor.forClass(String.class);
            verify(response, times(1)).addHeader(eq(HttpHeaders.SET_COOKIE), headerCaptor.capture());

            String setCookie = headerCaptor.getValue();
            assertTrue(setCookie.contains("accessToken=abc123"), "should contain name=value");
            assertTrue(setCookie.contains("Max-Age=3600"), "should contain Max-Age");
            assertTrue(setCookie.contains("Path=/"), "should contain Path=/");
            assertTrue(setCookie.contains("HttpOnly"), "should be HttpOnly");
            assertTrue(setCookie.contains("SameSite=Lax"), "should have SameSite=Lax");
            // localhost domain is NOT included in the cookie (see CookieUtils logic)
            assertFalse(setCookie.contains("Domain="), "should NOT set Domain for localhost");
        }

        @Test
        @DisplayName("should set Domain when not localhost")
        void addCookie_NonLocalhost_SetsDomain() {
            ReflectionTestUtils.setField(cookieUtils, "cookieDomain", "example.com");

            cookieUtils.addCookie(response, "token", "val", 100);

            ArgumentCaptor<String> headerCaptor = ArgumentCaptor.forClass(String.class);
            verify(response).addHeader(eq(HttpHeaders.SET_COOKIE), headerCaptor.capture());

            assertTrue(headerCaptor.getValue().contains("Domain=example.com"));
        }

        @Test
        @DisplayName("should set Secure flag when configured")
        void addCookie_Secure() {
            ReflectionTestUtils.setField(cookieUtils, "cookieSecure", true);

            cookieUtils.addCookie(response, "token", "val", 100);

            ArgumentCaptor<String> headerCaptor = ArgumentCaptor.forClass(String.class);
            verify(response).addHeader(eq(HttpHeaders.SET_COOKIE), headerCaptor.capture());

            assertTrue(headerCaptor.getValue().contains("Secure"));
        }
    }

    // ── getCookie ───────────────────────────────────────────────────────────

    @Nested
    @DisplayName("getCookie()")
    class GetCookieTests {

        @Test
        @DisplayName("should return value when cookie exists")
        void getCookie_Found() {
            Cookie[] cookies = {
                    new Cookie("cookie1", "value1"),
                    new Cookie("testCookie", "testValue"),
                    new Cookie("cookie2", "value2")
            };
            when(request.getCookies()).thenReturn(cookies);

            Optional<String> result = cookieUtils.getCookie(request, "testCookie");

            assertTrue(result.isPresent());
            assertEquals("testValue", result.get());
        }

        @Test
        @DisplayName("should return empty when cookie not found")
        void getCookie_NotFound() {
            Cookie[] cookies = {
                    new Cookie("cookie1", "value1"),
                    new Cookie("cookie2", "value2")
            };
            when(request.getCookies()).thenReturn(cookies);

            Optional<String> result = cookieUtils.getCookie(request, "nonExistent");

            assertFalse(result.isPresent());
        }

        @Test
        @DisplayName("should return empty when no cookies at all")
        void getCookie_NoCookies() {
            when(request.getCookies()).thenReturn(null);

            Optional<String> result = cookieUtils.getCookie(request, "testCookie");

            assertFalse(result.isPresent());
        }
    }

    // ── deleteCookie ────────────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteCookie()")
    class DeleteCookieTests {

        @Test
        @DisplayName("should set cookie with Max-Age=0 and empty value")
        void deleteCookie_SetsHeader() {
            cookieUtils.deleteCookie(response, "accessToken");

            ArgumentCaptor<String> headerCaptor = ArgumentCaptor.forClass(String.class);
            verify(response, times(1)).addHeader(eq(HttpHeaders.SET_COOKIE), headerCaptor.capture());

            String setCookie = headerCaptor.getValue();
            assertTrue(setCookie.contains("accessToken="), "should contain name");
            assertTrue(setCookie.contains("Max-Age=0"), "should set Max-Age=0 to delete");
            assertTrue(setCookie.contains("HttpOnly"), "should be HttpOnly");
        }
    }

    // ── deleteAllAuthCookies ────────────────────────────────────────────────

    @Nested
    @DisplayName("deleteAllAuthCookies()")
    class DeleteAllAuthCookiesTests {

        @Test
        @DisplayName("should delete both accessToken and refreshToken cookies")
        void deleteAllAuthCookies_DeletesBoth() {
            cookieUtils.deleteAllAuthCookies(response);

            // Should produce two Set-Cookie headers (one for each cookie)
            verify(response, times(2)).addHeader(eq(HttpHeaders.SET_COOKIE), anyString());
        }
    }
}
