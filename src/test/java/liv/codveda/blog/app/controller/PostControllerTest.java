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
class PostControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void testGetAllPosts_Public() throws Exception {
        mockMvc.perform(get("/api/v1/post/list")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testCreatePost_Authenticated() throws Exception {
        Map<String, String> postRequest = Map.of(
                "title", "Test Post",
                "content", "Test Content",
                "category", "Technology"
        );

        mockMvc.perform(post("/api/v1/post")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isOk());
    }

    @Test
    void testCreatePost_Unauthenticated() throws Exception {
        Map<String, String> postRequest = Map.of(
                "title", "Test Post",
                "content", "Test Content"
        );

        mockMvc.perform(post("/api/v1/post")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testGetPostById_Authenticated() throws Exception {
        mockMvc.perform(get("/api/v1/post/1"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testUpdatePost_Authenticated() throws Exception {
        Map<String, String> postRequest = Map.of(
                "title", "Updated Post",
                "content", "Updated Content"
        );

        mockMvc.perform(put("/api/v1/post/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(postRequest)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testDeletePost_Authenticated() throws Exception {
        mockMvc.perform(delete("/api/v1/post/1"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetPostsByCategory_Public() throws Exception {
        mockMvc.perform(get("/api/v1/post/category/Technology")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetCategories_Public() throws Exception {
        mockMvc.perform(get("/api/v1/post/categories"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testLikePost_Authenticated() throws Exception {
        mockMvc.perform(post("/api/v1/post/1/like"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "test@example.com", roles = "USER")
    void testUnlikePost_Authenticated() throws Exception {
        mockMvc.perform(delete("/api/v1/post/1/like"))
                .andExpect(status().isOk());
    }

    @Test
    void testGetTotalPosts_Public() throws Exception {
        mockMvc.perform(get("/api/v1/post/total"))
                .andExpect(status().isOk());
    }
}
