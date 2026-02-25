package liv.codveda.blog.app.domain.dto.response;

public record AdminAnalyticsDto(
        long totalPosts,
        long totalComments,
        long totalPostLikes,
        long totalCommentLikes,
        long totalCommentDislikes,
        long totalPostViews
) {}
