package liv.codveda.blog.app.controller;

import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.Paged;
import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.dto.response.UsersDto;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.mapper.interfaces.PostMapper;
import liv.codveda.blog.app.domain.mapper.interfaces.UserMapper;
import liv.codveda.blog.app.service.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/user")
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;
    private final PostMapper postMapper;
    @Autowired
    public UserController(UserService userService, UserMapper userMapper, PostMapper postMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
        this.postMapper = postMapper;
    }

    @GetMapping("/total")
    public ResponseEntity<ApiResponse<Integer>> getUserTotal() {
        return ResponseEntity.ok(new ApiResponse<>(userService.getUserTotal(),
                "total users retrieved successfully"));
    }


    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Paged<UsersDto>>> getAllUsers(Pageable pageable) {
        Page<Users> users = userService.getAllUsers(pageable);
        Paged<UsersDto> response = new Paged<>(
                users.getContent().stream().map(userMapper::userToUserDto).toList(),
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages(),
                users.isLast()
        );
        return ResponseEntity.ok(new ApiResponse<>(response, "user list retrieved successfully"));

    }



    @GetMapping("get-user/{userId}")
    public ResponseEntity<ApiResponse<UsersDto>> getUser(@PathVariable Long userId) {
        Users user = userService.getUserById(userId);
        return ResponseEntity.ok(new ApiResponse<>(userMapper.userToUserDto(user),
                "user retrieved successfully"));
    }

    @GetMapping("get-user-profile")
    public ResponseEntity<ApiResponse<UsersDto>> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        Users userProfile = userService.getMyInfo(email);
        return ResponseEntity.ok(new ApiResponse<>(userMapper.userToUserDto(userProfile),
                "user profile retrieved successfully"));
    }

    @GetMapping("/posts-history/{id}")
    public ResponseEntity<ApiResponse<List<PostDto>>> getUserBookingHistory(@PathVariable Long id) {

        Users user = userService.getUserBlogHistory(id);
        List<PostDto> postDtos = user.getPosts()
                .stream()
                .map(postMapper::postToPostDto)
                .toList();

        return ResponseEntity.ok(new ApiResponse<>(postDtos, "User posting history retrieved successfully"));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        this.userService.deleteUserById(userId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{userId}")
    public ResponseEntity<ApiResponse<UsersDto>> updateUser(
            @RequestBody @Valid UsersDto userDto , @PathVariable Long userId
    ) {
        Users updatedUser = userService.updateUserById(userId,userMapper.userDtoToUser(userDto));
        return ResponseEntity.ok(new ApiResponse<>(userMapper.userToUserDto(updatedUser), "user with ID" + userId + " updated successfully"));
    }





}
