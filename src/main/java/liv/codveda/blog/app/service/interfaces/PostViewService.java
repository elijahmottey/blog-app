package liv.codveda.blog.app.service.interfaces;

public interface PostViewService {
    void recordView(Long postId);
    long countViews(Long postId);
}