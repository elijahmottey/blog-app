package liv.codveda.blog.app.controller;

import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.CommentDto;
import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.entities.Comment;
import liv.codveda.blog.app.domain.enums.ReactionType;
import liv.codveda.blog.app.domain.mapper.interfaces.CommentMapper;
import liv.codveda.blog.app.service.interfaces.CommentReactionService;
import liv.codveda.blog.app.service.interfaces.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/comment")
public class CommentController {

    private final CommentService commentService;
    private final CommentMapper commentMapper;
    private final CommentReactionService commentReactionService;

    @Autowired
    public CommentController(CommentService commentService, CommentMapper commentMapper, CommentReactionService commentReactionService) {
        this.commentService = commentService;
        this.commentMapper = commentMapper;
        this.commentReactionService = commentReactionService;
    }

    @PostMapping("/{postId}")
    public ResponseEntity<ApiResponse<CommentDto>> createComment(
            @PathVariable Long postId,
            @Valid @RequestBody CommentDto commentDto) {

        Comment comment = commentMapper.commentDtoToComment(commentDto);
        Comment savedComment = commentService.createComment(postId, comment);

        CommentDto base = commentMapper.commentToCommentDto(savedComment);
        CommentDto enriched = enrichCommentDto(base);
        ApiResponse<CommentDto> response = new ApiResponse<>(enriched, "Comment created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/{postId}/reply/{parentId}")
    public ResponseEntity<ApiResponse<CommentDto>> replyToComment(
            @PathVariable Long postId,
            @PathVariable Long parentId,
            @Valid @RequestBody CommentDto commentDto) {
        Comment comment = commentMapper.commentDtoToComment(commentDto);
        Comment saved = commentService.createReply(postId, parentId, comment);
        CommentDto enriched = enrichCommentDto(commentMapper.commentToCommentDto(saved));
        return ResponseEntity.status(HttpStatus.CREATED).body(new ApiResponse<>(enriched, "Reply created successfully"));
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<Integer>> getTotalComments(){
        Integer totalComments = commentService.getTotalComments();
        return ResponseEntity.ok(new ApiResponse<>(totalComments, "Total comments retrieved successfully"));
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

        CommentDto enriched = enrichCommentDto(commentMapper.commentToCommentDto(updatedComment));
        return ResponseEntity.ok(new ApiResponse<>(enriched, "Comment updated successfully"));
    }

    @GetMapping("/post")
    public ResponseEntity<ApiResponse<Paged<CommentDto>>> getCommentsByPost(
            Pageable pageable) {

        Page<Comment> comments = commentService.getCommentsByPost(pageable);
        Paged<CommentDto> response = new Paged<>(
                comments.getContent().stream().map(commentMapper::commentToCommentDto).map(this::enrichCommentDto).toList(),
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
                comments.getContent().stream().map(commentMapper::commentToCommentDto).map(this::enrichCommentDto).toList(),
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
        CommentDto enriched = enrichCommentDto(commentMapper.commentToCommentDto(comment));
        return ResponseEntity.ok(new ApiResponse<>(enriched, "Comment retrieved successfully"));
    }

    // --- Comment reactions ---
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> likeComment(@PathVariable Long id) {
        commentReactionService.setReaction(id, ReactionType.LIKE);
        return ResponseEntity.ok(new ApiResponse<>(null, "Comment liked successfully"));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> unlikeComment(@PathVariable Long id) {
        commentReactionService.removeReaction(id);
        return ResponseEntity.ok(new ApiResponse<>(null, "Comment like removed successfully"));
    }

    @PostMapping("/{id}/dislike")
    public ResponseEntity<ApiResponse<Void>> dislikeComment(@PathVariable Long id) {
        commentReactionService.setReaction(id, ReactionType.DISLIKE);
        return ResponseEntity.ok(new ApiResponse<>(null, "Comment disliked successfully"));
    }

    @DeleteMapping("/{id}/dislike")
    public ResponseEntity<ApiResponse<Void>> undislikeComment(@PathVariable Long id) {
        commentReactionService.removeReaction(id);
        return ResponseEntity.ok(new ApiResponse<>(null, "Comment dislike removed successfully"));
    }

    private CommentDto enrichCommentDto(CommentDto base) {
        Long likes = commentReactionService.countReactions(base.id(), ReactionType.LIKE);
        Long dislikes = commentReactionService.countReactions(base.id(), ReactionType.DISLIKE);
        Boolean isLiked = null;
        Boolean isDisliked = null;
        try {
            var mine = commentReactionService.getMyReaction(base.id());
            isLiked = ReactionType.LIKE.equals(mine);
            isDisliked = ReactionType.DISLIKE.equals(mine);
        } catch (Exception ignored) {}
        return new CommentDto(
                base.id(),
                base.content(),
                base.users(),
                base.posts(),
                base.parentId(),
                likes,
                dislikes,
                isLiked,
                isDisliked,
                base.createdAt(),
                base.updatedAt()
        );
    }
}