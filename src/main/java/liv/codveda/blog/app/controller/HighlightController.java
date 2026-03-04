package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.request.HighlightRequest;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.HighlightDto;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.service.interfaces.HighlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/highlights")
@RequiredArgsConstructor
public class HighlightController {

    private final HighlightService highlightService;

    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<HighlightDto>> addHighlight(
            @PathVariable Long postId,
            @RequestBody HighlightRequest request,
            @AuthenticationPrincipal Users user
    ) {
        HighlightDto highlight = highlightService.addHighlight(postId, request, user);
        return ResponseEntity.ok(new ApiResponse<>(highlight, "Highlight added"));
    }

    @DeleteMapping("/{highlightId}")
    public ResponseEntity<ApiResponse<Void>> deleteHighlight(
            @PathVariable Long highlightId,
            @AuthenticationPrincipal Users user
    ) {
        highlightService.deleteHighlight(highlightId, user);
        return ResponseEntity.ok(new ApiResponse<>(null, "Highlight deleted"));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<List<HighlightDto>>> getHighlights(
            @PathVariable Long postId,
            @AuthenticationPrincipal Users user
    ) {
        List<HighlightDto> highlights = highlightService.getHighlights(postId, user);
        return ResponseEntity.ok(new ApiResponse<>(highlights, "Success"));
    }

    @PutMapping("/{highlightId}/note")
    public ResponseEntity<ApiResponse<HighlightDto>> updateNote(
            @PathVariable Long highlightId,
            @RequestBody String note,
            @AuthenticationPrincipal Users user
    ) {
        HighlightDto highlight = highlightService.updateNote(highlightId, note, user);
        return ResponseEntity.ok(new ApiResponse<>(highlight, "Note updated"));
    }
}