package liv.codveda.blog.app.security;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import liv.codveda.blog.app.security.util.CookieUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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

    @Test
    void testAddCookie() {
        ArgumentCaptor<Cookie> cookieCaptor = ArgumentCaptor.forClass(Cookie.class);

        cookieUtils.addCookie(response, "testCookie", "testValue", 3600);

        verify(response, times(1)).addCookie(cookieCaptor.capture());
        Cookie cookie = cookieCaptor.getValue();

        assertEquals("testCookie", cookie.getName());
        assertEquals("testValue", cookie.getValue());
        assertEquals(3600, cookie.getMaxAge());
        assertEquals("/", cookie.getPath());
        assertTrue(cookie.isHttpOnly());
        assertFalse(cookie.getSecure());
    }

    @Test
    void testGetCookie_Found() {
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
    void testGetCookie_NotFound() {
        Cookie[] cookies = {
                new Cookie("cookie1", "value1"),
                new Cookie("cookie2", "value2")
        };
        when(request.getCookies()).thenReturn(cookies);

        Optional<String> result = cookieUtils.getCookie(request, "nonExistent");

        assertFalse(result.isPresent());
    }

    @Test
    void testGetCookie_NoCookies() {
        when(request.getCookies()).thenReturn(null);

        Optional<String> result = cookieUtils.getCookie(request, "testCookie");

        assertFalse(result.isPresent());
    }

    @Test
    void testDeleteCookie() {
        ArgumentCaptor<Cookie> cookieCaptor = ArgumentCaptor.forClass(Cookie.class);

        cookieUtils.deleteCookie(response, "testCookie");

        verify(response, times(1)).addCookie(cookieCaptor.capture());
        Cookie cookie = cookieCaptor.getValue();

        assertEquals("testCookie", cookie.getName());
        assertNull(cookie.getValue());
        assertEquals(0, cookie.getMaxAge());
    }
}
