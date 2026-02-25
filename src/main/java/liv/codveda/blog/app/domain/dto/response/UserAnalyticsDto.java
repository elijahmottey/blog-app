package liv.codveda.blog.app.domain.dto.response;

public record UserAnalyticsDto(
        long totalPosts,
        long totalComments,
        long totalPostLikes,
        long totalCommentLikes,
        long totalCommentDislikes,
        long totalPostViews
) {}
