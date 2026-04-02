package liv.codveda.blog.app.security.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
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
    // 15 minutes access token expiration as requested
    private static final long ACCESS_TOKEN_EXPIRATION = 9000000L;
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
        return generateToken(userDetails, secretKey, ACCESS_TOKEN_EXPIRATION, "ACCESS");
    }

    public String generateRefreshToken(UserDetails userDetails) {
        return generateToken(userDetails, refreshSecretKey, REFRESH_TOKEN_EXPIRATION, "REFRESH");
    }

    private String generateToken(UserDetails userDetails, SecretKey key, long expiration, String tokenType) {
        Map<String, Object> claims = new HashMap<>();
        List<String> authorities = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
        
        claims.put("authorities", authorities);
        claims.put("tokenType", tokenType);
        
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .claims(claims)
                .subject(userDetails.getUsername())
                .issuedAt(now)
                .expiration(expiryDate)
                .id(UUID.randomUUID().toString())
                .signWith(key)
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, secretKey, Claims::getSubject);
    }

    public List<String> extractAuthorities(String token) {
        Claims claims = extractAllClaims(token, secretKey);
        return (List<String>) claims.get("authorities");
    }

    public String extractTokenType(String token) {
        Claims claims = extractAllClaims(token, secretKey);
        return (String) claims.get("tokenType");
    }

    public <T> T extractClaim(String token, SecretKey key, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token, key);
        return claimsResolver.apply(claims);
    }

    /**
     * Parse and verify a JWT token with the specified signing key.
     * No fallback to other keys — this prevents key confusion attacks.
     */
    private Claims extractAllClaims(String token, SecretKey key) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isValidAccessToken(String token, UserDetails userDetails) {
        try {
            return validateToken(token, userDetails, secretKey, "ACCESS");
        } catch (ExpiredJwtException e) {
            log.debug("Access token expired: {}", e.getMessage(), e);
            return false;
        } catch (JwtException e) {
            log.debug("Access token validation failed: {}", e.getMessage(), e);
            return false;
        }
    }

    public boolean isValidRefreshToken(String token, UserDetails userDetails) {
        try {
            return validateToken(token, userDetails, refreshSecretKey, "REFRESH");
        } catch (ExpiredJwtException e) {
            log.debug("Refresh token expired: {}", e.getMessage(), e);
            return false;
        } catch (JwtException e) {
            log.debug("Refresh token validation failed: {}", e.getMessage(), e);
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
        } catch (ExpiredJwtException e) {
            log.debug("Token expired: {}", e.getMessage(), e);
            return false;
        } catch (JwtException e) {
            log.debug("Token validation failed: {}", e.getMessage(), e);
            return false;
        }

    }

    public Instant extractExpiration(String token) {
        try {
            return extractClaim(token, secretKey, Claims::getExpiration).toInstant();
        } catch (JwtException e) {
            log.debug("Failed to extract expiration from access token: {}", e.getMessage(), e);
            try {
                return extractClaim(token, refreshSecretKey, Claims::getExpiration).toInstant();
            } catch (JwtException refreshException) {
                log.debug("Failed to extract expiration from refresh token: {}", refreshException.getMessage(), refreshException);
                throw refreshException;
            }
        }
    }
}