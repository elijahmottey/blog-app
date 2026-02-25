package liv.codveda.blog.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.PostView;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.repository.PostViewRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.PostViewService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PostViewServiceImpl implements PostViewService {

    private final PostViewRepository postViewRepository;
    private final PostRepository postRepository;
    private final UsersRepository usersRepository;

    public PostViewServiceImpl(PostViewRepository postViewRepository,
                               PostRepository postRepository,
                               UsersRepository usersRepository) {
        this.postViewRepository = postViewRepository;
        this.postRepository = postRepository;
        this.usersRepository = usersRepository;
    }

    private Users getAuthenticatedUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || "anonymousUser".equals(auth.getName())) {
            return null;
        }
        return usersRepository.findByEmail(auth.getName()).orElse(null);
    }

    private Post getPostOrThrow(Long postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new EntityNotFoundException("Post with id " + postId + " not found"));
    }

    @Override
    @Transactional
    public void recordView(Long postId) {
        Users user = getAuthenticatedUserOrNull();
        if (user == null) {
            // Only track authenticated users uniquely; skip for anonymous
            return;
        }
        Post post = getPostOrThrow(postId);
        postViewRepository.findByUserAndPost(user, post)
                .orElseGet(() -> postViewRepository.save(new PostView(null, user, post, null, null)));
    }

    @Override
    @Transactional(readOnly = true)
    public long countViews(Long postId) {
        Post post = getPostOrThrow(postId);
        return postViewRepository.countByPost(post);
    }
}
