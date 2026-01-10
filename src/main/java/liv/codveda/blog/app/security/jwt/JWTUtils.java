package liv.codveda.blog.app.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
public class JWTUtils {
    private static final long ACCESS_TOKEN_EXPIRATION = 3600000L; // 1 hour
    private static final long REFRESH_TOKEN_EXPIRATION = 604800000L; // 1 week
    private final SecretKey secretKey;
    private final SecretKey refreshSecretKey;

    public JWTUtils(
            @Value("${jwt.secret}") String secretString,
            @Value("${jwt.refresh-secret}") String refreshSecretString
    ) {
        // Better way to handle keys in JJWT 0.12.x
        this.secretKey = Keys.hmacShaKeyFor(secretString.getBytes(StandardCharsets.UTF_8));
        this.refreshSecretKey = Keys.hmacShaKeyFor(refreshSecretString.getBytes(StandardCharsets.UTF_8));

    }


    public String generateAccessToken(UserDetails userDetails) {
        return generateToken(userDetails, secretKey, ACCESS_TOKEN_EXPIRATION);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(userDetails, refreshSecretKey, REFRESH_TOKEN_EXPIRATION);
    }

    private String generateToken(UserDetails userDetails, SecretKey key, long expiration) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("authorities", userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList()));
        claims.put("tokenType", expiration == ACCESS_TOKEN_EXPIRATION ? "ACCESS" : "REFRESH");

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .id(UUID.randomUUID().toString())
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public List<String> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token);
        return (List<String>) claims.get("authorities");
    }

    public String extractTokenType(String token) {
        Claims claims = extractAllClaims(token);
        return (String) claims.get("tokenType");
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (ExpiredJwtException e) {
            log.warn("Token expired: {}", e.getMessage());
            throw e;
        } catch (SignatureException e) {
            // Try with refresh token secret if access token secret fails
            try {
                return Jwts.parser()
                        .verifyWith(refreshSecretKey)
                        .build()
                        .parseSignedClaims(token)
                        .getPayload();
            } catch (Exception ex) {
                log.error("Invalid token signature: {}", ex.getMessage());
                throw ex;
            }
        }
    }

    public boolean isValidAccessToken(String token, UserDetails userDetails) {
        try {
            return validateToken(token, userDetails, secretKey, "ACCESS");
        } catch (Exception e) {
            log.warn("Access token validation failed: {}", e.getMessage());
            return false;
        }
    }

    public boolean isValidRefreshToken(String token, UserDetails userDetails) {
        try {
            return validateToken(token, userDetails, refreshSecretKey, "REFRESH");
        } catch (Exception e) {
            log.warn("Refresh token validation failed: {}", e.getMessage());
            return false;
        }
    }

    private boolean validateToken(String token, UserDetails userDetails, SecretKey key, String tokenType) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String username = claims.getSubject();
            Date expiration = claims.getExpiration();
            String actualTokenType = (String) claims.get("tokenType");

            return username.equals(userDetails.getUsername()) &&
                    !expiration.before(new Date()) &&
                    tokenType.equals(actualTokenType);
        } catch (Exception e) {
            log.warn("Token validation failed: {}", e.getMessage());
            return false;
        }

    }

    public Instant extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration).toInstant();
    }

}