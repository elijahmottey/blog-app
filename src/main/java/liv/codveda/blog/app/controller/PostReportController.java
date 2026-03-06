package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.dto.response.PostReportDto;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.PostReport;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.exception.ConflictException;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.PostReportRepository;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/reports")
public class PostReportController {

    private final PostReportRepository reportRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;
    private final NotificationService notificationService;

    public PostReportController(PostReportRepository reportRepository, PostRepository postRepository, UsersRepository usersRepository, NotificationService notificationService) {
        this.reportRepository = reportRepository;
        this.postRepository = postRepository;
        this.usersRepository = usersRepository;
        this.notificationService = notificationService;
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<Void>> reportPost(@PathVariable Long postId, @RequestBody Map<String, String> body) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        Users user = usersRepository.findByEmail(email).orElseThrow(() -> new NotFoundException("User not found"));
        Post post = postRepository.findById(postId).orElseThrow(() -> new NotFoundException("Post not found"));

        if (reportRepository.existsByPostIdAndReporterId(postId, user.getId())) {
            throw new ConflictException("You have already reported this post");
        }

        PostReport report = PostReport.builder()
                .post(post)
                .reporter(user)
                .reason(body.getOrDefault("reason", "No reason provided"))
                .build();
        reportRepository.save(report);

        // Notify admins
        List<Users> admins = usersRepository.findByRole(Roles.ADMIN);
        for (Users admin : admins) {
            notificationService.createNotification(
                admin,
                "REPORT",
                "Post reported: " + post.getTitle() + ". Reason: " + report.getReason(),
                post.getId()
            );
        }

        return ResponseEntity.ok(new ApiResponse<>(null, "Post reported successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<Paged<PostReportDto>>> getReports(Pageable pageable) {
        Page<PostReport> reports = reportRepository.findAllByOrderByCreatedAtDesc(pageable);
        Paged<PostReportDto> response = new Paged<>(
                reports.getContent().stream()
                        .map(r -> new PostReportDto(
                                r.getId(),
                                r.getPost().getId(),
                                r.getPost().getTitle(),
                                r.getReporter().getId(),
                                r.getReporter().getName(),
                                r.getReason(),
                                r.getCreatedAt()
                        ))
                        .toList(),
                reports.getNumber(),
                reports.getSize(),
                reports.getTotalElements(),
                reports.getTotalPages(),
                reports.isLast()
        );
        return ResponseEntity.ok(new ApiResponse<>(response, "Reports retrieved successfully"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReport(@PathVariable Long id) {
        reportRepository.deleteById(id);
        return ResponseEntity.ok(new ApiResponse<>(null, "Report deleted successfully"));
    }
}
