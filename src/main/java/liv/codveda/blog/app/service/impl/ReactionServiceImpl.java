package liv.codveda.blog.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Reaction;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.ReactionType;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.repository.ReactionRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.ReactionService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class ReactionServiceImpl implements ReactionService {

    private final ReactionRepository reactionRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;

    public ReactionServiceImpl(ReactionRepository reactionRepository,
                               PostRepository postRepository,
                               UsersRepository usersRepository) {
        this.reactionRepository = reactionRepository;
        this.postRepository = postRepository;
        this.usersRepository = usersRepository;
    }

    private Users getAuthenticatedUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null) {
            throw new EntityNotFoundException("No authenticated user in context");
        }
        String email = auth.getName();
        return usersRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found with email: " + email));
    }

    private Post getPostOrThrow(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post with id " + postId + " not found"));
    }

    @Override
    @Transactional
    public void setReaction(Long postId, ReactionType type) {
        Users user = getAuthenticatedUser();
        Post post = getPostOrThrow(postId);

        Optional<Reaction> existing = reactionRepository.findByUserAndPost(user, post);
        if (existing.isPresent()) {
            Reaction r = existing.get();
            // If the same reaction type is set again, keep it as is.
            r.setType(type);
            reactionRepository.save(r);
        } else {
            Reaction r = new Reaction();
            r.setUser(user);
            r.setPost(post);
            r.setType(type);
            reactionRepository.save(r);
        }
    }

    @Override
    @Transactional
    public void removeReaction(Long postId) {
        Users user = getAuthenticatedUser();
        Post post = getPostOrThrow(postId);
        reactionRepository.findByUserAndPost(user, post).ifPresent(reactionRepository::delete);
    }

    @Override
    @Transactional(readOnly = true)
    public long countReactions(Long postId, ReactionType type) {
        Post post = getPostOrThrow(postId);
        return reactionRepository.countByPostAndType(post, type);
    }

    @Override
    @Transactional(readOnly = true)
    public ReactionType getMyReaction(Long postId) {
        Users user = getAuthenticatedUser();
        Post post = getPostOrThrow(postId);
        return reactionRepository.findTypeByUserAndPost(user, post).orElse(null);
    }
}
