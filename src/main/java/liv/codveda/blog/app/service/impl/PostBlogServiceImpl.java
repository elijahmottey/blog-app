package liv.codveda.blog.app.service.impl;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class PostBlogServiceImpl implements BlogService {
    private final PostRepository postRepository;

    @Autowired
    public PostBlogServiceImpl(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    @Override

    public Post postBlog(Post post) {

        return postRepository.save(post);
    }


    @Override
    public void deletePost(Long id) {
        Post post = this.getPostById(id);
        this.postRepository.delete(post);
    }


    @Override
    public List<Post> getPosts() {
        return this.postRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    @Override
    public Post getPostById(Long id) {
        return this.postRepository.findById(id)
                .orElseThrow(
                        ()-> new EntityNotFoundException("Post with "+id +" not found"));
    }

    @Override
    public Page<Post> getPostByTitle(String title, Pageable pageable) {
        return postRepository.findByTitleContainingIgnoreCase(title,pageable);
    }

    @Override
    public Post updatePost(Long id, Post post) {
        Post existingPost = this.getPostById(id);
        if(post.getTitle() != null) existingPost.setTitle(post.getTitle());
        if (post.getContent() != null) existingPost.setContent(post.getContent());
        return postRepository.save(existingPost);
    }
}
