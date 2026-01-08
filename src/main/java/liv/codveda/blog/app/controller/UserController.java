package liv.codveda.blog.app.controller;

import liv.codveda.blog.app.domain.dto.response.ApiResponse;
import liv.codveda.blog.app.domain.dto.response.UsersDto;
import liv.codveda.blog.app.domain.mapper.interfaces.UserMapper;
import liv.codveda.blog.app.service.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/v1/users")
public class UserController {
    private final UserService userService;
    private final UserMapper userMapper;
    @Autowired
    public UserController(UserService userService, UserMapper userMapper) {
        this.userService = userService;
        this.userMapper = userMapper;
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


}
