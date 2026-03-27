package liv.codveda.blog.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import liv.codveda.blog.app.domain.dto.request.Register;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "jwt.secret=testSecretKeyThatIsLongEnoughForHS256AlgorithmTesting",
    "jwt.refresh-secret=testRefreshSecretKeyThatIsLongEnoughForHS256Testing",
    "app.admin.email=admin@test.com",
    "app.admin.name=Admin User",
    "app.admin.password=Password123!"
})
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void testGetAllUsers_Admin() throws Exception {
        mockMvc.perform(get("/api/v1/user/list")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void testGetAllUsers_User_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/user/list"))
                .andExpect(status().isForbidden());
    }

    @Test
    void testGetAllUsers_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/user/list"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testGetUserProfile_Authenticated() throws Exception {
        mockMvc.perform(get("/api/v1/user/get-user-profile"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void testGetUserById_Admin() throws Exception {
        mockMvc.perform(get("/api/v1/user/get-user/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void testCreateUser_Admin() throws Exception {
        Register userDto = new Register();
        userDto.setName("New User");
        userDto.setEmail("newuser@example.com");
        userDto.setPassword("Password123!");

        mockMvc.perform(post("/api/v1/user/create")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testUpdateUser_Authenticated() throws Exception {
        Register userDto = new Register();
        userDto.setName("Updated Name");
        userDto.setEmail("updated@example.com");

        mockMvc.perform(put("/api/v1/user/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userDto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void testDeleteUser_Admin() throws Exception {
        mockMvc.perform(delete("/api/v1/user/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void testDeleteUser_User_Forbidden() throws Exception {
        mockMvc.perform(delete("/api/v1/user/1"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void testGetTotalUsers_Admin() throws Exception {
        mockMvc.perform(get("/api/v1/user/total"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void testGetUserPostHistory_Admin() throws Exception {
        mockMvc.perform(get("/api/v1/user/posts-history/1"))
                .andExpect(status().isOk());
    }
}
