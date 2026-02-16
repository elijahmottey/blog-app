package liv.codveda.blog.app.controller;

import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testCreateComment_Authenticated() throws Exception {
        Map<String, String> commentRequest = Map.of("content", "Test Comment");

        mockMvc.perform(post("/api/v1/comment/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testCreateComment_Unauthenticated() throws Exception {
        Map<String, String> commentRequest = Map.of("content", "Test Comment");

        mockMvc.perform(post("/api/v1/comment/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testGetCommentById_Authenticated() throws Exception {
        mockMvc.perform(get("/api/v1/comment/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testGetCommentsByPostId_Authenticated() throws Exception {
        mockMvc.perform(get("/api/v1/comment/post/1")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void testGetAllComments_Admin() throws Exception {
        mockMvc.perform(get("/api/v1/comment/post")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void testGetAllComments_User_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/comment/post"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testUpdateComment_Authenticated() throws Exception {
        Map<String, String> commentRequest = Map.of("content", "Updated Comment");

        mockMvc.perform(put("/api/v1/comment/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testDeleteComment_Authenticated() throws Exception {
        mockMvc.perform(delete("/api/v1/comment/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteComment_Unauthenticated() throws Exception {
        mockMvc.perform(delete("/api/v1/comment/1"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "admin@example.com", roles = "ADMIN")
    void testGetTotalComments_Admin() throws Exception {
        mockMvc.perform(get("/api/v1/comment/total"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@example.com", roles = "USER")
    void testGetTotalComments_User_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/comment/total"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testCreateComment_EmptyContent() throws Exception {
        Map<String, String> commentRequest = Map.of("content", "");

        mockMvc.perform(post("/api/v1/comment/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(commentRequest)))
                .andExpect(status().isBadRequest());
    }
}
