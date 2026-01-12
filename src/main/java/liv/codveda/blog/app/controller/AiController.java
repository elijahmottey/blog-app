package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.service.AiChatService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final AiChatService aiChatService;

    public AiController(AiChatService aiChatService) {
        this.aiChatService = aiChatService;
    }

    @GetMapping("/chat")
    public ResponseEntity<ApiResponse<String>> chat(@RequestParam String prompt) {
         // Optional context, e.g., blog post content

        String promptTemplate = """
You are an AI writing assistant for a blog platform called "BlogCraft".\s
Your role is to help users create, refine, and optimize blog content.

User Query: %s

Please follow these guidelines strictly:
- Respond in a helpful, professional, and encouraging tone.
- If the query is unclear, ask one clarifying question.
- Keep responses focused on blogging, writing, SEO, or content strategy.
- Do not generate harmful, misleading, or plagiarized content.
- Format your response using clear paragraphs and markdown for readability (e.g., **bold**, lists, headings).

If the user asks for creative content (like a blog post draft), provide an outline or example, not a full final post unless requested.
""";
        String finalPrompt = String.format(promptTemplate, prompt);
        String response = aiChatService.generateResponse(finalPrompt);
        
        return ResponseEntity.ok(new ApiResponse<>(response, "AI response generated successfully"));
    }
}
