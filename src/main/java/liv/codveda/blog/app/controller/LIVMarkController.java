package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.service.interfaces.LIVMarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/livmarks")
@RequiredArgsConstructor
public class LIVMarkController {

    private final LIVMarkService livMarkService;

    @PostMapping("/{postId}")
    public ResponseEntity<ApiResponse<String>> toggleLIVMark(
            @PathVariable Long postId,
            @AuthenticationPrincipal Users user
    ) {
        livMarkService.toggleLIVMark(postId, user);
        return ResponseEntity.ok(new ApiResponse<>("Success", null));
    }

    @GetMapping("/{postId}/status")
    public ResponseEntity<ApiResponse<Boolean>> isLIVMarked(
            @PathVariable Long postId,
            @AuthenticationPrincipal Users user
    ) {
        boolean isMarked = livMarkService.isLIVMarked(postId, user);
        return ResponseEntity.ok(new ApiResponse<>("Success", isMarked));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Paged<PostDto>>> getLIVMarkedPosts(
            @AuthenticationPrincipal Users user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Paged<PostDto> posts = livMarkService.getLIVMarkedPosts(user, pageable);
        return ResponseEntity.ok(new ApiResponse<>("Success", posts));
    }
}