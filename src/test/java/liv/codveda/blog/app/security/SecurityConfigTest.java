package liv.codveda.blog.app.security;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void testPublicEndpoints_Accessible() throws Exception {
        mockMvc.perform(get("/api/v1/post/list"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/post/categories"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/csrf"))
                .andExpect(status().isOk());
    }

    @Test
    void testProtectedEndpoints_RequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/user/list"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/post"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testCsrfToken_SetInCookie() throws Exception {
        mockMvc.perform(get("/api/v1/csrf"))
                .andExpect(status().isOk())
                .andExpect(cookie().exists("XSRF-TOKEN"));
    }

    @Test
    void testCorsHeaders_Present() throws Exception {
        mockMvc.perform(get("/api/v1/post/list")
                        .header("Origin", "http://localhost:5173"))
                .andExpect(status().isOk())
                .andExpect(header().exists("Access-Control-Allow-Origin"));
    }

    @Test
    void testSecurityHeaders_Present() throws Exception {
        mockMvc.perform(get("/api/v1/post/list"))
                .andExpect(header().exists("X-Content-Type-Options"))
                .andExpect(header().exists("X-XSS-Protection"))
                .andExpect(header().exists("Content-Security-Policy"));
    }
}
