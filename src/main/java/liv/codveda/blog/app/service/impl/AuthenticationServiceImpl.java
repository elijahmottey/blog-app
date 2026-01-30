package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.dto.request.Login;
import liv.codveda.blog.app.domain.dto.request.Register;
import liv.codveda.blog.app.domain.dto.response.BlogResponse;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.exception.ConflictException;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.security.jwt.JWTUtils;
import liv.codveda.blog.app.service.interfaces.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
    private final UsersRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JWTUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UsersRepository usersRepository;



    @Autowired
    public AuthenticationServiceImpl(UsersRepository userRepository, PasswordEncoder passwordEncoder, JWTUtils jwtUtils, AuthenticationManager authenticationManager, UsersRepository usersRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.authenticationManager = authenticationManager;
        this.usersRepository = usersRepository;
    }

    @Override
    public ResponseEntity<BlogResponse> authenticate(Login request) {
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

        BlogResponse response = BlogResponse.builder()
                .message("Authentication successful!")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .accessTokenExpiration(accessTokenExpiration)
                .refreshTokenExpiration(refreshTokenExpiration)
                .name(user.getName())
                .role(user.getRole())
                .build();

        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<?> register(Register request) {
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

        // Extract expiration times
        Instant accessTokenExpiration = jwtUtils.extractExpiration(accessToken);
        Instant refreshTokenExpiration = jwtUtils.extractExpiration(refreshToken);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BlogResponse.builder()
                        .message("User registered successfully!")
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .accessTokenExpiration(accessTokenExpiration)
                        .refreshTokenExpiration(refreshTokenExpiration)
                        .name(admin.getName())
                        .role(admin.getRole())
                        .build());
    }

    @Override
    public ResponseEntity<?> registerAdmin(Register request) {
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

        // Extract expiration times
        Instant accessTokenExpiration = jwtUtils.extractExpiration(accessToken);
        Instant refreshTokenExpiration = jwtUtils.extractExpiration(refreshToken);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BlogResponse.builder()
                        .message("Admin registered successfully!")
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .accessTokenExpiration(accessTokenExpiration)
                        .refreshTokenExpiration(refreshTokenExpiration)
                        .name(admin.getName())
                        .role(admin.getRole())
                        .build());
    }


}
