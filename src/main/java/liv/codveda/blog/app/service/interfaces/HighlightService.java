package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.dto.request.HighlightRequest;
import liv.codveda.blog.app.domain.dto.response.HighlightDto;
import liv.codveda.blog.app.domain.entities.Users;

import java.util.List;

public interface HighlightService {
    HighlightDto addHighlight(Long postId, HighlightRequest request, Users user);
    void deleteHighlight(Long highlightId, Users user);
    List<HighlightDto> getHighlights(Long postId, Users user);
    HighlightDto updateNote(Long highlightId, String note, Users user);
}