package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.enums.ReactionType;

public interface ReactionService {
    void setReaction(Long postId, ReactionType type);
    void removeReaction(Long postId);
    long countReactions(Long postId, ReactionType type);
    ReactionType getMyReaction(Long postId);
}