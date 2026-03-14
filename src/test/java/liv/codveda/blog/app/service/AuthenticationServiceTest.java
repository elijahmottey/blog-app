package liv.codveda.blog.app.service;

import jakarta.servlet.http.HttpServletResponse;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.exception.ConflictException;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.security.jwt.JWTUtils;
import liv.codveda.blog.app.security.util.CookieUtils;
import liv.codveda.blog.app.service.impl.AuthenticationServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JWTUtils jwtUtils;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private CookieUtils cookieUtils;

    @Mock
    private HttpServletResponse response;

    @InjectMocks
    private AuthenticationServiceImpl authenticationService;

    private Users testUser;
    private Register registerRequest;
    private Login loginRequest;

    @BeforeEach
    void setUp() {
        testUser = Users.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Roles.USER)
                .build();

        registerRequest = new Register();
        registerRequest.setName("Test User");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Password123!");

        loginRequest = new Login("test@example.com", "Password123!");
    }

    @Test
    void testRegister_Success() {
        when(usersRepository.existsByEmail(anyString())).thenReturn(false);
        when(Objects.requireNonNull(passwordEncoder.encode(anyString()))).thenReturn("encodedPassword");
        when(usersRepository.save(any(Users.class))).thenReturn(testUser);
        when(jwtUtils.generateAccessToken(any())).thenReturn("accessToken");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtUtils.extractExpiration(anyString())).thenReturn(Instant.now());

        var result = authenticationService.register(registerRequest, response);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        verify(usersRepository, times(1)).save(any(Users.class));
        verify(cookieUtils, times(1)).addCookie(any(), eq("accessToken"), anyString(), eq(3600));
        verify(cookieUtils, times(1)).addCookie(any(), eq("refreshToken"), anyString(), eq(604800));
    }

    @Test
    void testRegister_EmailAlreadyExists() {
        when(usersRepository.existsByEmail(anyString())).thenReturn(true);

        assertThrows(ConflictException.class, () -> 
            authenticationService.register(registerRequest, response)
        );

        verify(usersRepository, never()).save(any());
    }

    @Test
    void testAuthenticate_Success() {
        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(usersRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
        when(jwtUtils.generateAccessToken(any())).thenReturn("accessToken");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtUtils.extractExpiration(anyString())).thenReturn(Instant.now());

        var result = authenticationService.authenticate(loginRequest, response);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        verify(authenticationManager, times(1)).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(cookieUtils, times(1)).addCookie(any(), eq("accessToken"), anyString(), eq(3600));
    }

    @Test
    void testAuthenticate_UserNotFound() {
        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(usersRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(NotFoundException.class, () -> 
            authenticationService.authenticate(loginRequest, response)
        );
    }

    @Test
    void testRegisterAdmin_Success() {
        when(usersRepository.existsByEmail(anyString())).thenReturn(false);
        when(Objects.requireNonNull(passwordEncoder.encode(anyString()))).thenReturn("encodedPassword");
        when(usersRepository.save(any(Users.class))).thenReturn(testUser);
        when(jwtUtils.generateAccessToken(any())).thenReturn("accessToken");
        when(jwtUtils.generateRefreshToken(any())).thenReturn("refreshToken");
        when(jwtUtils.extractExpiration(anyString())).thenReturn(Instant.now());

        var result = authenticationService.registerAdmin(registerRequest, response);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        verify(usersRepository, times(1)).save(any(Users.class));
    }
}
