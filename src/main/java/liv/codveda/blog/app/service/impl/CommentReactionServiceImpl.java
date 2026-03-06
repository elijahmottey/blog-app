package liv.codveda.blog.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.entities.CommentReaction;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.ReactionType;
import liv.codveda.blog.app.repository.CommentReactionRepository;
import liv.codveda.blog.app.repository.CommentRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.CommentReactionService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentReactionServiceImpl implements CommentReactionService {
    private final CommentReactionRepository commentReactionRepository;
    private final CommentRepository commentRepository;
    private final UsersRepository usersRepository;

    public CommentReactionServiceImpl(CommentReactionRepository commentReactionRepository,
                                      CommentRepository commentRepository,
                                      UsersRepository usersRepository) {
        this.commentReactionRepository = commentReactionRepository;
        this.commentRepository = commentRepository;
        this.usersRepository = usersRepository;
    }

    public Users getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new IllegalStateException("Unauthenticated");
        }
        return usersRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new IllegalStateException("User not found: " + auth.getName()));
    }

    private Comment getCommentOrThrow(Long commentId) {
        return commentRepository.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("Comment with id " + commentId + " not found"));
    }

    @Override
    @Transactional
    @CacheEvict(value = {"commentReactions", "myCommentReaction"}, allEntries = true)
    public void setReaction(Long commentId, ReactionType type) {
        Users user = getAuthenticatedUser();
        Comment comment = getCommentOrThrow(commentId);

        CommentReaction reaction = commentReactionRepository.findByUserAndComment(user, comment)
                .orElseGet(() -> {
                    CommentReaction cr = new CommentReaction();
                    cr.setUser(user);
                    cr.setComment(comment);
                    return cr;
                });
        reaction.setType(type);
        commentReactionRepository.save(reaction);
    }

    @Override
    @Transactional
    @CacheEvict(value = {"commentReactions", "myCommentReaction"}, allEntries = true)
    public void removeReaction(Long commentId) {
        Users user = getAuthenticatedUser();
        Comment comment = getCommentOrThrow(commentId);
        commentReactionRepository.findByUserAndComment(user, comment)
                .ifPresent(commentReactionRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "commentReactions", key = "#commentId + '-' + #type")
    public Long countReactions(Long commentId, ReactionType type) {
        Comment comment = getCommentOrThrow(commentId);
        return commentReactionRepository.countByCommentAndType(comment, type);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "myCommentReaction", key = "#commentId + '-' + #root.target.getAuthenticatedUser().id")
    public ReactionType getMyReaction(Long commentId) {
        Users user = getAuthenticatedUser();
        Comment comment = getCommentOrThrow(commentId);
        return commentReactionRepository.findTypeByUserAndComment(user, comment).orElse(null);
    }
}
