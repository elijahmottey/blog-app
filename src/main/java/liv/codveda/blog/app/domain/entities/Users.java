package liv.codveda.blog.app.domain.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import liv.codveda.blog.app.domain.enums.Roles;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Users entity represents an authenticated user in the system.
 * It implements UserDetails so Spring Security can use it directly
 * for authentication and authorization.
 */
@Entity
@Table(name = "users")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Users implements UserDetails {

    /**
     * Primary key for the users table.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_seq")
    @SequenceGenerator(
            name = "user_seq",
            sequenceName = "user_sequence",
            allocationSize = 1
    )
    @Column(name = "user_id")
    private Long id;


    /**
     * Full name of the user.
     * Cannot be null or empty.
     */
    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    /**
     * Email address used for login.
     * Must be unique and valid.
     */
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Encrypted password (BCrypt).
     */
    @NotBlank(message = "Password is required")
    @Column(nullable = false)
    private String password;

    /**
     * Role of the user (USER or ADMIN).
     * Stored as a string in the database.
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Roles role;

    /**
     * Timestamp automatically set when the user is created.
     */
    @CreationTimestamp
    private LocalDateTime createdAt;

    /**
     * Timestamp automatically updated whenever the user record changes.
     */
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "users", cascade = CascadeType.ALL)
    private List<Post> posts;

    @OneToMany(mappedBy = "author", cascade = CascadeType.ALL)
    private List<Comment> comments;



    // ================= SPRING SECURITY METHODS =================

    /**
     * Returns the authorities (roles) granted to the user.
     * Spring Security requires roles to start with "ROLE_".
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    /**
     * Returns the username used for authentication.
     * We use email instead of a separate username field.
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Indicates whether the account has expired.
     * Returning true means the account is valid.
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Indicates whether the account is locked.
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Indicates whether the credentials (password) have expired.
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Indicates whether the user is enabled.
     */
    @Override
    public boolean isEnabled() {
        return true;
    }


    @Override
    public String toString() {
        return "Users{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role=" + role +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
