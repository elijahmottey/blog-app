package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.entities.LIVMark;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.mapper.interfaces.PostMapper;
import liv.codveda.blog.app.exception.ResourceNotFoundException;
import liv.codveda.blog.app.repository.LIVMarkRepository;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.service.interfaces.LIVMarkService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LIVMarkServiceImpl implements LIVMarkService {

    private final LIVMarkRepository livMarkRepository;
    private final PostRepository postRepository;
    private final PostMapper postMapper;

    @Override
    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "livMarks", allEntries = true),
        @CacheEvict(value = "isLIVMarked", key = "#postId + '-' + #user.id")
    })
    public void toggleLIVMark(Long postId, Users user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Optional<LIVMark> existingMark = livMarkRepository.findByUserAndPost(user, post);

        if (existingMark.isPresent()) {
            livMarkRepository.delete(existingMark.get());
        } else {
            LIVMark livMark = LIVMark.builder()
                    .user(user)
                    .post(post)
                    .build();
            livMarkRepository.save(livMark);
        }
    }

    @Override
    @Cacheable(value = "isLIVMarked", key = "#postId + '-' + #user.id")
    public boolean isLIVMarked(Long postId, Users user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        return livMarkRepository.existsByUserAndPost(user, post);
    }

    @Override
    @Cacheable(value = "livMarks", key = "#user.id + '-' + #pageable.pageNumber")
    public Paged<PostDto> getLIVMarkedPosts(Users user, Pageable pageable) {
        Page<LIVMark> marks = livMarkRepository.findByUser(user, pageable);
        
        Page<PostDto> postDtos = marks.map(mark -> {
            PostDto dto = postMapper.postToPostDto(mark.getPost());
            // Since we are fetching marked posts, isSaved is always true.
            return new PostDto(
                dto.id(), dto.title(), dto.category(), dto.content(), dto.user(),
                dto.createdAt(), dto.updatedAt(), dto.comments(),
                dto.likes(), dto.views(), dto.isLiked(), true
            );
        });

        return new Paged<>(
                postDtos.getContent(),
                postDtos.getNumber(),
                postDtos.getSize(),
                postDtos.getTotalElements(),
                postDtos.getTotalPages(),
                postDtos.isLast()
        );
    }
}