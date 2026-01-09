package liv.codveda.blog.app.controller;

import jakarta.validation.Valid;
import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.PostDto;
import liv.codveda.blog.app.domain.dto.response.UsersDto;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.mapper.interfaces.PostMapper;
import liv.codveda.blog.app.domain.mapper.interfaces.UserMapper;
import liv.codveda.blog.app.service.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
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


    @GetMapping("/list")
    @PreAuthorize("hasAuthority('ADMIN') ")
    public ResponseEntity<ApiResponse<List<UsersDto>>> getAllUsers() {

        List<UsersDto> users =  userService.getAllUsers()
                .stream()
                .map(userMapper::userToUserDto)
                .toList();
        return ResponseEntity.ok(new ApiResponse<>(users, "user list retrieved successfully"));

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

    @GetMapping("/bookings-history/{id}")
    public ResponseEntity<ApiResponse<List<PostDto>>> getUserBookingHistory(@PathVariable Long id) {

        Users user = userService.getUserBlogHistory(id);
        List<PostDto> postDtos = user.getPosts()
                .stream()
                .map(postMapper::postToPostDto)
                .toList();

        return ResponseEntity.ok(new ApiResponse<>(postDtos, "User booking history retrieved successfully"));
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
