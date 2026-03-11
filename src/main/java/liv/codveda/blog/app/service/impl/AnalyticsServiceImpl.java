package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.dto.response.AdminAnalyticsDto;
import liv.codveda.blog.app.domain.dto.response.UserAnalyticsDto;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.ReactionType;
import liv.codveda.blog.app.repository.*;
import liv.codveda.blog.app.service.interfaces.AnalyticsService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final ReactionRepository reactionRepository;
    private final CommentReactionRepository commentReactionRepository;
    private final PostViewRepository postViewRepository;
    private final UsersRepository usersRepository;

    public AnalyticsServiceImpl(PostRepository postRepository,
            CommentRepository commentRepository,
            ReactionRepository reactionRepository,
            CommentReactionRepository commentReactionRepository,
            PostViewRepository postViewRepository,
            UsersRepository usersRepository) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.reactionRepository = reactionRepository;
        this.commentReactionRepository = commentReactionRepository;
        this.postViewRepository = postViewRepository;
        this.usersRepository = usersRepository;
    }

    private Users getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new IllegalStateException("Unauthenticated");
        }
        if (auth.getPrincipal() instanceof Users) {
            return (Users) auth.getPrincipal();
        }
        return usersRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found: " + auth.getName()));
    }

    @Override
    public AdminAnalyticsDto getAdminOverview() {
        long totalPosts = postRepository.count();
        long totalComments = commentRepository.count();
        long totalPostLikes = reactionRepository.countByType(ReactionType.LIKE);
        long totalCommentLikes = commentReactionRepository.countByType(ReactionType.LIKE);
        long totalCommentDislikes = commentReactionRepository.countByType(ReactionType.DISLIKE);
        long totalPostViews = postViewRepository.count();
        return new AdminAnalyticsDto(
                totalPosts,
                totalComments,
                totalPostLikes,
                totalCommentLikes,
                totalCommentDislikes,
                totalPostViews);
    }

    @Override
    public UserAnalyticsDto getMyOverview() {
        Users me = getAuthenticatedUser();
        Long userId = me.getId();
        long totalPosts = postRepository.countByUsers_Id(userId);
        long totalComments = commentRepository.countByPost_Users_Id(userId);
        long totalPostLikes = reactionRepository.countByPost_Users_IdAndType(userId, ReactionType.LIKE);
        long totalCommentLikes = commentReactionRepository.countByComment_Post_Users_IdAndType(userId,
                ReactionType.LIKE);
        long totalCommentDislikes = commentReactionRepository.countByComment_Post_Users_IdAndType(userId,
                ReactionType.DISLIKE);
        long totalPostViews = postViewRepository.countByPost_Users_Id(userId);
        return new UserAnalyticsDto(
                totalPosts,
                totalComments,
                totalPostLikes,
                totalCommentLikes,
                totalCommentDislikes,
                totalPostViews);
    }
}
