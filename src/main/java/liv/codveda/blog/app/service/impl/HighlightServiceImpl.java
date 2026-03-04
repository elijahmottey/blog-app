package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.dto.request.HighlightRequest;
import liv.codveda.blog.app.domain.dto.response.HighlightDto;
import liv.codveda.blog.app.domain.entities.Highlight;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.exception.ResourceNotFoundException;
import liv.codveda.blog.app.repository.HighlightRepository;
import liv.codveda.blog.app.repository.PostRepository;
import liv.codveda.blog.app.service.interfaces.HighlightService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HighlightServiceImpl implements HighlightService {

    private final HighlightRepository highlightRepository;
    private final PostRepository postRepository;

    @Override
    @Transactional
    public HighlightDto addHighlight(Long postId, HighlightRequest request, Users user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));

        Highlight highlight = Highlight.builder()
                .user(user)
                .post(post)
                .selectedText(request.getSelectedText())
                .note(request.getNote())
                .startOffset(request.getStartOffset())
                .endOffset(request.getEndOffset())
                .color(request.getColor())
                .build();

        Highlight saved = highlightRepository.save(highlight);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public void deleteHighlight(Long highlightId, Users user) {
        Highlight highlight = highlightRepository.findById(highlightId)
                .orElseThrow(() -> new ResourceNotFoundException("Highlight not found"));
        
        if (!highlight.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to delete this highlight");
        }
        
        highlightRepository.delete(highlight);
    }

    @Override
    public List<HighlightDto> getHighlights(Long postId, Users user) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new ResourceNotFoundException("Post not found"));
        
        return highlightRepository.findByUserAndPost(user, post).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HighlightDto updateNote(Long highlightId, String note, Users user) {
        Highlight highlight = highlightRepository.findById(highlightId)
                .orElseThrow(() -> new ResourceNotFoundException("Highlight not found"));

        if (!highlight.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("You are not authorized to update this highlight");
        }

        highlight.setNote(note);
        Highlight updated = highlightRepository.save(highlight);
        return mapToDto(updated);
    }

    private HighlightDto mapToDto(Highlight highlight) {
        return HighlightDto.builder()
                .id(highlight.getId())
                .postId(highlight.getPost().getId())
                .selectedText(highlight.getSelectedText())
                .note(highlight.getNote())
                .startOffset(highlight.getStartOffset())
                .endOffset(highlight.getEndOffset())
                .color(highlight.getColor())
                .createdAt(highlight.getCreatedAt())
                .build();
    }
}