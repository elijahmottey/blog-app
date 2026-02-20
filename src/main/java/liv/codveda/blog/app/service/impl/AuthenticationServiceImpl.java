package liv.codveda.blog.app.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import liv.codveda.blog.app.domain.dto.response.BlogResponse;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.exception.ConflictException;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.exception.UnauthorizedException;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.security.jwt.JWTUtils;
import liv.codveda.blog.app.security.util.CookieUtils;
import liv.codveda.blog.app.service.interfaces.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UsersRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UsersRepository usersRepository;
    private final CookieUtils cookieUtils;



    @Autowired
    public AuthenticationServiceImpl(UsersRepository userRepository, PasswordEncoder passwordEncoder, JWTUtils jwtUtils, AuthenticationManager authenticationManager, UsersRepository usersRepository, CookieUtils cookieUtils) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.usersRepository = usersRepository;
        this.cookieUtils = cookieUtils;
    }

    @Override
    public ResponseEntity<BlogResponse> authenticate(Login request, HttpServletResponse response) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );

        var user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new NotFoundException("Authenticated user not found in database."));

        String accessToken = jwtUtils.generateAccessToken(user);
        String refreshToken = jwtUtils.generateRefreshToken(user);
        Instant accessTokenExpiration = jwtUtils.extractExpiration(accessToken);
        Instant refreshTokenExpiration = jwtUtils.extractExpiration(refreshToken);

        // Set tokens in cookies
        cookieUtils.addCookie(response, "accessToken", accessToken, 3600); // 1 hour
        cookieUtils.addCookie(response, "refreshToken", refreshToken, 604800); // 7 days

        BlogResponse blogResponse = BlogResponse.builder()
                .message("Authentication successful!")
                .accessTokenExpiration(accessTokenExpiration)
                .refreshTokenExpiration(refreshTokenExpiration)
                .name(user.getName())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(blogResponse);
    }

    @Override
    public ResponseEntity<?> register(Register request, HttpServletResponse response) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException(HttpStatus.CONFLICT, "Email is already in use.");
        }

        var admin = Users.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Roles.USER)
                .build();

        userRepository.save(admin);

        String accessToken = jwtUtils.generateAccessToken(admin);
        String refreshToken = jwtUtils.generateRefreshToken(admin);

        Instant accessTokenExpiration = jwtUtils.extractExpiration(accessToken);
        Instant refreshTokenExpiration = jwtUtils.extractExpiration(refreshToken);

        // Set tokens in cookies
        cookieUtils.addCookie(response, "accessToken", accessToken, 3600);
        cookieUtils.addCookie(response, "refreshToken", refreshToken, 604800);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BlogResponse.builder()
                        .message("User registered successfully!")
                        .accessTokenExpiration(accessTokenExpiration)
                        .refreshTokenExpiration(refreshTokenExpiration)
                        .name(admin.getName())
                        .role(admin.getRole())
                        .build());
    }

    @Override
    public ResponseEntity<?> registerAdmin(Register request, HttpServletResponse response) {
        if (usersRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException(HttpStatus.CONFLICT, "Email is already in use.");
        }

        var admin = Users.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Roles.ADMIN)
                .build();

        userRepository.save(admin);

        String accessToken = jwtUtils.generateAccessToken(admin);
        String refreshToken = jwtUtils.generateRefreshToken(admin);

        Instant accessTokenExpiration = jwtUtils.extractExpiration(accessToken);
        Instant refreshTokenExpiration = jwtUtils.extractExpiration(refreshToken);

        // Set tokens in cookies
        cookieUtils.addCookie(response, "accessToken", accessToken, 3600);
        cookieUtils.addCookie(response, "refreshToken", refreshToken, 604800);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BlogResponse.builder()
                        .message("Admin registered successfully!")
                        .accessTokenExpiration(accessTokenExpiration)
                        .refreshTokenExpiration(refreshTokenExpiration)
                        .name(admin.getName())
                        .role(admin.getRole())
                        .build());
    }

    @Override
    public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        Optional<String> maybeRefresh = cookieUtils.getCookie(request, "refreshToken");
        if (maybeRefresh.isEmpty()) {
            throw new UnauthorizedException("Refresh token not present");
        }

        String refreshToken = maybeRefresh.get();
        String username = jwtUtils.extractUsername(refreshToken);
        var user = userRepository.findByEmail(username)
                .orElseThrow(() -> new NotFoundException("User for refresh token not found"));

        if (!jwtUtils.isValidRefreshToken(refreshToken, user)) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        String newAccessToken = jwtUtils.generateAccessToken(user);
        String newRefreshToken = jwtUtils.generateRefreshToken(user); // rotate refresh token

        Instant accessTokenExpiration = jwtUtils.extractExpiration(newAccessToken);
        Instant refreshTokenExpiration = jwtUtils.extractExpiration(newRefreshToken);

        cookieUtils.addCookie(response, "accessToken", newAccessToken, 3600);
        cookieUtils.addCookie(response, "refreshToken", newRefreshToken, 604800);

        BlogResponse blogResponse = BlogResponse.builder()
                .message("Token refreshed")
                .accessTokenExpiration(accessTokenExpiration)
                .refreshTokenExpiration(refreshTokenExpiration)
                .name(user.getName())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(blogResponse);
    }


}
