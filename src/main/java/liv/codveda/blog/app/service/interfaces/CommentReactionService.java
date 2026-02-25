package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.enums.ReactionType;

public interface CommentReactionService {
    void setReaction(Long commentId, ReactionType type);
    void removeReaction(Long commentId);
    Long countReactions(Long commentId, ReactionType type);
    ReactionType getMyReaction(Long commentId);
}
