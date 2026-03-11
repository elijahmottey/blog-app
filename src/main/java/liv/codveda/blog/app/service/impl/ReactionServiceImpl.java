package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Reaction;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.ReactionType;
import liv.codveda.blog.app.exception.UnauthorizedException;

import liv.codveda.blog.app.repository.ReactionRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.BlogService;
import liv.codveda.blog.app.service.interfaces.NotificationService;
import liv.codveda.blog.app.service.interfaces.ReactionService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ReactionServiceImpl implements ReactionService {

    private final ReactionRepository reactionRepository;
    private final BlogService postService; // Use PostService instead of PostRepository
    private final UsersRepository usersRepository;
    private final NotificationService notificationService;

    public ReactionServiceImpl(ReactionRepository reactionRepository,
            BlogService postService, // Inject PostService
            UsersRepository usersRepository,
            NotificationService notificationService,
            @Lazy ReactionService reactionService) {
        this.reactionRepository = reactionRepository;
        this.postService = postService; // Use PostService
        this.usersRepository = usersRepository;
        this.notificationService = notificationService;
    }

    public Users getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            throw new UnauthorizedException("Authentication required");
        }
        if (auth.getPrincipal() instanceof Users) {
            return (Users) auth.getPrincipal();
        }
        return usersRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new UnauthorizedException("Authenticated user not found"));
    }

    private Post getPostOrThrow(Long postId) {
        // Use PostService which should have caching
        return postService.getPostById(postId);
    }

    @Override
    @Transactional
    @CacheEvict(value = { "postReactions", "myPostReaction" }, allEntries = true)
    public void setReaction(Long postId, ReactionType type) {
        Users user = getAuthenticatedUser();
        Post post = getPostOrThrow(postId); // Now uses cached post if available

        Optional<Reaction> existing = reactionRepository.findByUserAndPost(user, post);
        if (existing.isPresent()) {
            Reaction r = existing.get();
            r.setType(type);
            reactionRepository.save(r);
        } else {
            Reaction r = new Reaction();
            r.setUser(user);
            r.setPost(post);
            r.setType(type);
            reactionRepository.save(r);

            if (type == ReactionType.LIKE && !post.getUsers().getId().equals(user.getId())) {
                notificationService.createNotification(
                        post.getUsers(),
                        "LIKE",
                        user.getName() + " liked your post: " + post.getTitle(),
                        postId);
            }
        }
    }

    @Override
    @Transactional
    @CacheEvict(value = { "postReactions", "myPostReaction" }, allEntries = true)
    public void removeReaction(Long postId) {
        Users user = getAuthenticatedUser();
        Post post = getPostOrThrow(postId); // Now uses cached post if available
        reactionRepository.findByUserAndPost(user, post).ifPresent(reactionRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "postReactions", key = "#postId + '-' + #type")
    public long countReactions(Long postId, ReactionType type) {
        Post post = getPostOrThrow(postId); // Now uses cached post if available
        return reactionRepository.countByPostAndType(post, type);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "myPostReaction", key = "#postId + '-' + #root.target.getAuthenticatedUser().id")
    public ReactionType getMyReaction(Long postId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        Users user = getAuthenticatedUser();
        Post post = getPostOrThrow(postId); // Now uses cached post if available
        return reactionRepository.findTypeByUserAndPost(user, post).orElse(null);
    }
}