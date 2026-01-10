package liv.codveda.blog.app.controller;

import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.CommentDto;
import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.mapper.interfaces.CommentMapper;
import liv.codveda.blog.app.service.interfaces.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/comments")
public class CommentController {

    private final CommentService commentService;
    private final CommentMapper commentMapper;

    @Autowired
    public CommentController(CommentService commentService, CommentMapper commentMapper) {
        this.commentService = commentService;
        this.commentMapper = commentMapper;
    }

    @PostMapping("/{postId}")
    public ResponseEntity<ApiResponse<CommentDto>> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentDto commentDto) {

        Comment comment = commentMapper.commentDtoToComment(commentDto);
        Comment savedComment = commentService.createComment(postId, comment);

        CommentDto responseDto = commentMapper.commentToCommentDto(savedComment);
        ApiResponse<CommentDto> response = new ApiResponse<>(responseDto, "Comment created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(@PathVariable Long id) {
        commentService.deleteComment(id);
        return ResponseEntity.ok(new ApiResponse<>(null, "Comment deleted successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CommentDto>> updateComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentDto commentDto) {

        Comment comment = commentMapper.commentDtoToComment(commentDto);
        comment.setId(id); // Ensure ID is set for update
        Comment updatedComment = commentService.updateComment(comment);

        CommentDto responseDto = commentMapper.commentToCommentDto(updatedComment);
        return ResponseEntity.ok(new ApiResponse<>(responseDto, "Comment updated successfully"));
    }

    @GetMapping("/post")
    public ResponseEntity<ApiResponse<Paged<CommentDto>>> getCommentsByPost(
            Pageable pageable) {

        Page<Comment> comments = commentService.getCommentsByPost(pageable);
        Paged<CommentDto> response = new Paged<>(
                comments.getContent().stream().map(commentMapper::commentToCommentDto).toList(),
                comments.getNumber(),
                comments.getSize(),
                comments.getTotalElements(),
                comments.getTotalPages(),
                comments.isLast()
        );
        return ResponseEntity.ok(new ApiResponse<>(response, "Comments retrieved successfully"));
    }

    @GetMapping("/post/{postId}")
    public ResponseEntity<ApiResponse<Paged<CommentDto>>> getCommentsByPostById(
            @PathVariable Long postId,
            Pageable pageable) {

        Page<Comment> comments = commentService.getCommentsByPostById(postId, pageable);
        Paged<CommentDto> response = new Paged<>(
                comments.getContent().stream().map(commentMapper::commentToCommentDto).toList(),
                comments.getNumber(),
                comments.getSize(),
                comments.getTotalElements(),
                comments.getTotalPages(),
                comments.isLast()
        );
        return ResponseEntity.ok(new ApiResponse<>(response, "Comments retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CommentDto>> getCommentById(@PathVariable Long id) {
        Comment comment = commentService.getCommentById(id);
        CommentDto responseDto = commentMapper.commentToCommentDto(comment);
        return ResponseEntity.ok(new ApiResponse<>(responseDto, "Comment retrieved successfully"));
    }
}