package liv.codveda.blog.app.controller;


import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.entities.Post;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.mapper.interfaces.PostMapper;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.BlogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/v1/posts")
public class BlogPostController  {
    private final PostMapper postMapper;
    private final BlogService blogService;

    @Autowired
    public BlogPostController(PostMapper postMapper, BlogService blogService) {
        this.postMapper = postMapper;
        this.blogService = blogService;
    }

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



    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePost(@PathVariable Long id) {
        blogService.deletePost(id);
        return ResponseEntity.ok(new ApiResponse<>(null, "Post deleted successfully"));
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

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PostDto>> getPostById(@PathVariable Long id) {
        Post post = blogService.getPostById(id);
        PostDto responseDto = postMapper.postToPostDto(post);
        return ResponseEntity.ok(new ApiResponse<>(responseDto, "Post retrieved successfully"));
    }


    @GetMapping("search-titles")
    public ResponseEntity<ApiResponse<Page<PostDto>>> searchPostByTitle(
            @RequestParam String title,
            Pageable pageable) {

        Page<Post> postPage = blogService.getPostByTitle(title, pageable);

        return ResponseEntity.ok(new ApiResponse<>(postPage.map(postMapper::postToPostDto),
                "posts title retrieved successfully"));
    }
}
