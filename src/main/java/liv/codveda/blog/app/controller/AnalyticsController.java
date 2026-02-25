package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.response.AdminAnalyticsDto;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.UserAnalyticsDto;
import liv.codveda.blog.app.service.interfaces.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/admin/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminAnalyticsDto>> getAdminOverview() {
        var dto = analyticsService.getAdminOverview();
        return ResponseEntity.ok(new ApiResponse<>(dto, "Admin analytics retrieved successfully"));
        
    }
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserAnalyticsDto>> getMyOverview() {
        var dto = analyticsService.getMyOverview();
        return ResponseEntity.ok(new ApiResponse<>(dto, "User analytics retrieved successfully"));
    }
}
