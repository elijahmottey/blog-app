package liv.codveda.blog.app.controller;


import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Category;
import liv.codveda.blog.app.domain.enums.ReactionType;
import liv.codveda.blog.app.domain.mapper.interfaces.PostMapper;
import liv.codveda.blog.app.service.interfaces.BlogService;
import liv.codveda.blog.app.service.interfaces.LIVMarkService;
import liv.codveda.blog.app.service.interfaces.PostViewService;
import liv.codveda.blog.app.service.interfaces.ReactionService;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/post")
public class BlogPostController  {
    private final PostMapper postMapper;
    private final BlogService blogService;
    private final ReactionService reactionService;
    private final PostViewService postViewService;
    private final LIVMarkService livMarkService;

    @Autowired
    public BlogPostController(PostMapper postMapper, BlogService blogService,
                              ReactionService reactionService,
                              PostViewService postViewService,
                              LIVMarkService livMarkService) {
        this.postMapper = postMapper;
        this.blogService = blogService;
        this.reactionService = reactionService;
        this.postViewService = postViewService;
        this.livMarkService = livMarkService;
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping
    public ResponseEntity<ApiResponse<PostDto>> createPost(
            @Valid @RequestBody PostDto postDto) {

        Post post = postMapper.postDtoToPost(postDto);
        Post savedPost = blogService.postBlog(post);

        PostDto responseDto = postMapper.postToPostDto(savedPost);
        ApiResponse<PostDto> response =
                new ApiResponse<>(responseDto, "Post created successfully");

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }



    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        blogService.deletePost(id);
        return ResponseEntity.ok(new ApiResponse<>(null, "Post deleted successfully"));
    }
    @GetMapping("/total")
    public ResponseEntity<ApiResponse<Integer>> getTotalPosts(){
        Integer totalPosts = blogService.getTotalPosts();
        return ResponseEntity.ok(new ApiResponse<>(totalPosts, "Total posts retrieved successfully"));
    }


    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDto>> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostDto postDto) {

        Post post = postMapper.postDtoToPost(postDto);
        Post updatedPost = blogService.updatePost(id, post);

        PostDto responseDto = postMapper.postToPostDto(updatedPost);
        return ResponseEntity.ok(new ApiResponse<>(responseDto, "Post updated successfully"));
    }
    @GetMapping("/list")
//    @PreAuthorize("hasAuthority('ADMIN') ")
    public ResponseEntity<ApiResponse<Paged<PostDto>>> getAllPostsByUser(Pageable pageable) {
        Page<Post> post = blogService.getAllPosts(pageable);
        Paged<PostDto> postResponse = new Paged<>(
                post.getContent().stream().map(postMapper::postToPostDto).toList(),
                post.getNumber(),
                post.getSize(),
                post.getTotalElements(),
                post.getTotalPages(),
                post.isLast()
        );
        return ResponseEntity.ok(new ApiResponse<>(postResponse, "post list retrieved successfully"));

    }


    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDto>> getPostById(@PathVariable Long id) {
        // Record unique view for authenticated users
        postViewService.recordView(id);

        Post post = blogService.getPostById(id);
        PostDto baseDto = postMapper.postToPostDto(post);

        Long likeCount = reactionService.countReactions(id, ReactionType.LIKE);
        Long viewCount = postViewService.countViews(id);
        Boolean isLiked = null;
        Boolean isSaved = null;
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() instanceof Users user) {
                isLiked = ReactionType.LIKE.equals(reactionService.getMyReaction(id));
                isSaved = livMarkService.isLIVMarked(id, user);
            }
        } catch (Exception ignored) {
            // unauthenticated or no reaction
        }

        PostDto enriched = new PostDto(
                baseDto.id(),
                baseDto.title(),
                baseDto.category(),
                baseDto.content(),
                baseDto.user(),
                baseDto.createdAt(),
                baseDto.updatedAt(),
                baseDto.comments(),
                likeCount,
                viewCount,
                isLiked,
                isSaved
        );
        return ResponseEntity.ok(new ApiResponse<>(enriched, "Post retrieved successfully"));
    }


    @GetMapping("/search-titles")
    public ResponseEntity<ApiResponse<Page<PostDto>>> searchPostByTitle(
            @RequestParam String title,
            @PageableDefault(page = 0, size = 10) Pageable pageable

    ) {

        Page<Post> postPage = blogService.getPostByTitle(title, pageable);

        return ResponseEntity.ok(new ApiResponse<>(postPage.map(postMapper::postToPostDto),
                "posts title retrieved successfully"));
    }

    // New endpoint: get all categories
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        List<String> categories = blogService.getAllCategories();
        return ResponseEntity.ok(new ApiResponse<>(categories, "Categories retrieved successfully"));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<ApiResponse<Paged<PostDto>>> getPostsByCategory(
            @PathVariable String category,
            Pageable pageable
    ) {
        Category categoryEnum = Category.fromString(category);
        Page<Post> posts = blogService.getPostsByCategory(categoryEnum, pageable);
        Paged<PostDto> response = new Paged<>(
                posts.getContent().stream().map(postMapper::postToPostDto).toList(),
                posts.getNumber(),
                posts.getSize(),
                posts.getTotalElements(),
                posts.getTotalPages(),
                posts.isLast()
        );
        return ResponseEntity.ok(new ApiResponse<>(response, "Posts by category retrieved successfully"));
    }

    // ---- Reactions (Like) ----
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> likePost(@PathVariable Long id) {
        reactionService.setReaction(id, ReactionType.LIKE);
        return ResponseEntity.ok(new ApiResponse<>(null, "Post liked successfully"));
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<ApiResponse<Void>> unlikePost(@PathVariable Long id) {
        reactionService.removeReaction(id);
        return ResponseEntity.ok(new ApiResponse<>(null, "Like removed successfully"));
    }

    // ---- Views ----
    @GetMapping("/{id}/views")
    public ResponseEntity<ApiResponse<Long>> getPostViews(@PathVariable Long id) {
        long views = postViewService.countViews(id);
        return ResponseEntity.ok(new ApiResponse<>(views, "Post views retrieved successfully"));
    }

}