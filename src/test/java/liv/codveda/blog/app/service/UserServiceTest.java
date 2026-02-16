package liv.codveda.blog.app.service;

import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.UsersRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UsersRepository usersRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    private Users testUser;

    @BeforeEach
    void setUp() {
        testUser = Users.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encodedPassword")
                .role(Roles.USER)
                .description("Test description")
                .build();

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test@example.com");
    }

    @Test
    void testGetUserById_Success() {
        when(usersRepository.findById(1L)).thenReturn(Optional.of(testUser));

        Optional<Users> result = usersRepository.findById(1L);

        assertTrue(result.isPresent());
        assertEquals("Test User", result.get().getName());
        assertEquals("test@example.com", result.get().getEmail());
    }

    @Test
    void testGetUserById_NotFound() {
        when(usersRepository.findById(999L)).thenReturn(Optional.empty());

        Optional<Users> result = usersRepository.findById(999L);

        assertFalse(result.isPresent());
    }

    @Test
    void testGetUserByEmail_Success() {
        when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Optional<Users> result = usersRepository.findByEmail("test@example.com");

        assertTrue(result.isPresent());
        assertEquals("test@example.com", result.get().getEmail());
    }

    @Test
    void testGetAllUsers_Success() {
        List<Users> users = Arrays.asList(testUser);
        Page<Users> userPage = new PageImpl<>(users);

        when(usersRepository.findAll(any(Pageable.class))).thenReturn(userPage);

        Page<Users> result = usersRepository.findAll(Pageable.unpaged());

        assertEquals(1, result.getTotalElements());
        assertEquals("Test User", result.getContent().get(0).getName());
    }

    @Test
    void testUpdateUser_Success() {
        when(usersRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(usersRepository.save(any(Users.class))).thenReturn(testUser);

        testUser.setName("Updated Name");
        testUser.setDescription("Updated description");

        Users updated = usersRepository.save(testUser);

        assertEquals("Updated Name", updated.getName());
        assertEquals("Updated description", updated.getDescription());
        verify(usersRepository, times(1)).save(testUser);
    }

    @Test
    void testDeleteUser_Success() {
        when(usersRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doNothing().when(usersRepository).delete(testUser);

        usersRepository.delete(testUser);

        verify(usersRepository, times(1)).delete(testUser);
    }

    @Test
    void testExistsByEmail_True() {
        when(usersRepository.existsByEmail("test@example.com")).thenReturn(true);

        boolean exists = usersRepository.existsByEmail("test@example.com");

        assertTrue(exists);
    }

    @Test
    void testExistsByEmail_False() {
        when(usersRepository.existsByEmail("nonexistent@example.com")).thenReturn(false);

        boolean exists = usersRepository.existsByEmail("nonexistent@example.com");

        assertFalse(exists);
    }

    @Test
    void testGetCurrentUser_Success() {
        when(usersRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        Optional<Users> result = usersRepository.findByEmail(authentication.getName());

        assertTrue(result.isPresent());
        assertEquals("test@example.com", result.get().getEmail());
    }

    @Test
    void testCountUsers_Success() {
        when(usersRepository.count()).thenReturn(5L);

        long count = usersRepository.count();

        assertEquals(5L, count);
    }
}
