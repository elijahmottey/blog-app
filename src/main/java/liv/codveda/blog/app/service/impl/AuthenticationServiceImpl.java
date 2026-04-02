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
import liv.codveda.blog.app.domain.entities.RefreshToken;
import liv.codveda.blog.app.domain.entities.PasswordResetToken;
import liv.codveda.blog.app.repository.RefreshTokenRepository;
import liv.codveda.blog.app.repository.PasswordResetTokenRepository;
import liv.codveda.blog.app.service.interfaces.EmailService;
import liv.codveda.blog.app.domain.dto.request.ForgotPasswordRequest;
import liv.codveda.blog.app.domain.dto.request.ResetPasswordRequest;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthenticationServiceImpl implements AuthenticationService {
        private final UsersRepository userRepository;
        private final PasswordEncoder passwordEncoder;
        private final JWTUtils jwtUtils;
        private final AuthenticationManager authenticationManager;
        private final CookieUtils cookieUtils;
        private final RefreshTokenRepository refreshTokenRepository;
        private final PasswordResetTokenRepository passwordResetTokenRepository;
        private final EmailService emailService;

        @Autowired
        public AuthenticationServiceImpl(UsersRepository userRepository, PasswordEncoder passwordEncoder,
                        JWTUtils jwtUtils, AuthenticationManager authenticationManager, CookieUtils cookieUtils,
                        RefreshTokenRepository refreshTokenRepository,
                        PasswordResetTokenRepository passwordResetTokenRepository, EmailService emailService) {
                this.userRepository = userRepository;
                this.passwordEncoder = passwordEncoder;
                this.jwtUtils = jwtUtils;
                this.authenticationManager = authenticationManager;
                this.cookieUtils = cookieUtils;
                this.refreshTokenRepository = refreshTokenRepository;
                this.passwordResetTokenRepository = passwordResetTokenRepository;
                this.emailService = emailService;
        }

        @Override
        @Transactional
        public ResponseEntity<BlogResponse> authenticate(Login request, HttpServletResponse response) {
                authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.email(),
                                                request.password()));

                var user = userRepository.findByEmail(request.email())
                                .orElseThrow(() -> new NotFoundException("Authenticated user not found in database."));

                String accessToken = jwtUtils.generateAccessToken(user);
                String refreshToken = jwtUtils.generateRefreshToken(user);
                Instant accessTokenExpiration = jwtUtils.extractExpiration(accessToken);
                Instant refreshTokenExpiration = jwtUtils.extractExpiration(refreshToken);

                // Update existing refresh token or create new one
                Optional<RefreshToken> existingToken = refreshTokenRepository.findByUser(user);
                RefreshToken rt;
                if (existingToken.isPresent()) {
                        rt = existingToken.get();
                        rt.setToken(refreshToken);
                        rt.setExpiryDate(refreshTokenExpiration);
                } else {
                        rt = RefreshToken.builder()
                                        .user(user)
                                        .token(refreshToken)
                                        .expiryDate(refreshTokenExpiration)
                                        .build();
                }
                refreshTokenRepository.save(rt);

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
                        throw new ConflictException("Email is already in use.");
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

                // Save refresh token to DB
                // No need to check for existing token since it's a new user
                RefreshToken rt = RefreshToken.builder()
                                .user(admin)
                                .token(refreshToken)
                                .expiryDate(refreshTokenExpiration)
                                .build();
                refreshTokenRepository.save(rt);

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
                if (userRepository.existsByEmail(request.getEmail())) {
                        throw new ConflictException("Email is already in use.");
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

                // Save refresh token to DB
                RefreshToken rt = RefreshToken.builder()
                                .user(admin)
                                .token(refreshToken)
                                .expiryDate(refreshTokenExpiration)
                                .build();
                refreshTokenRepository.save(rt);

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
        @Transactional
        public ResponseEntity<?> refreshToken(HttpServletRequest request, HttpServletResponse response) {
                Optional<String> maybeRefresh = cookieUtils.getCookie(request, "refreshToken");
                if (maybeRefresh.isEmpty()) {
                        throw new UnauthorizedException("Refresh token not present");
                }

                String refreshToken = maybeRefresh.get();

                RefreshToken dbToken = refreshTokenRepository.findByToken(refreshToken)
                                .orElseThrow(() -> new UnauthorizedException("Invalid or revoked refresh token"));

                if (dbToken.getExpiryDate().isBefore(Instant.now())) {
                        refreshTokenRepository.delete(dbToken);
                        throw new UnauthorizedException("Refresh token expired");
                }

                String username = jwtUtils.extractUsername(refreshToken);
                Users user = userRepository.findByEmail(username)
                                .orElseThrow(() -> new NotFoundException("User for refresh token not found"));

                if (!jwtUtils.isValidRefreshToken(refreshToken, user)) {
                        throw new UnauthorizedException("Invalid refresh token");
                }

                String newAccessToken = jwtUtils.generateAccessToken(user);
                String newRefreshToken = jwtUtils.generateRefreshToken(user);

                Instant accessTokenExpiration = jwtUtils.extractExpiration(newAccessToken);
                Instant refreshTokenExpiration = jwtUtils.extractExpiration(newRefreshToken);

                dbToken.setToken(newRefreshToken);
                dbToken.setExpiryDate(refreshTokenExpiration);
                refreshTokenRepository.save(dbToken);

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

        @Override
        @Transactional
        public ResponseEntity<?> forgotPassword(ForgotPasswordRequest request) {
                var user = userRepository.findByEmail(request.getEmail());
                if (user.isEmpty()) {
                        // Still return success to avoid email enumeration
                        return ResponseEntity.ok(BlogResponse.builder()
                                        .message("If that email exists, a reset link was sent.")
                                        .build());
                }

                // Delete any existing reset tokens for this user
                passwordResetTokenRepository.deleteByUser(user.get());

                String tokenStr = UUID.randomUUID().toString();
                PasswordResetToken resetToken = PasswordResetToken.builder()
                                .token(tokenStr)
                                .user(user.get())
                                .expiryDate(LocalDateTime.now().plusHours(1))
                                .build();
                passwordResetTokenRepository.save(resetToken);

                // Send simulated email
                String resetLink = "http://localhost:5173/auth/reset-password?token=" + tokenStr;
                emailService.sendPasswordResetEmail(user.get().getEmail(), resetLink);

                return ResponseEntity.ok(BlogResponse.builder()
                                .message("If that email exists, a reset link was sent.")
                                .build());
        }

        @Override
        @Transactional
        public ResponseEntity<?> resetPassword(ResetPasswordRequest request) {
                PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                                .orElseThrow(() -> new UnauthorizedException(
                                                "Invalid or expired password reset token"));

                if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
                        passwordResetTokenRepository.delete(resetToken);
                        throw new UnauthorizedException("Password reset token has expired");
                }

                Users user = resetToken.getUser();
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
                userRepository.save(user);

                passwordResetTokenRepository.delete(resetToken);

                // Invalidate all active sessions
                refreshTokenRepository.deleteByUser(user);

                return ResponseEntity.ok(BlogResponse.builder()
                                .message("Password has been reset successfully.")
                                .build());
        }

        @Override
        @Transactional
        public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
                Optional<String> maybeRefresh = cookieUtils.getCookie(request, "refreshToken");
                if (maybeRefresh.isPresent()) {
                        refreshTokenRepository.findByToken(maybeRefresh.get())
                                        .ifPresent(refreshTokenRepository::delete);
                }

                cookieUtils.deleteCookie(response, "accessToken");
                cookieUtils.deleteCookie(response, "refreshToken");

                return ResponseEntity.ok(BlogResponse.builder()
                                .message("Logout successful")
                                .build());
        }

}
