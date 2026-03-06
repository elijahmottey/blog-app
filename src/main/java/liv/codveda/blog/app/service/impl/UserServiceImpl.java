package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserService self;

    @Autowired
    public UserServiceImpl(UsersRepository usersRepository,
                           PasswordEncoder passwordEncoder,
                           @Lazy UserService userService) {
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
        this.self = userService;
    }

    @Override
    @Cacheable(value = "users", key = "#pageable.pageNumber + '-' + #pageable.pageSize + '-' + #pageable.sort")
    public Page<Users> getAllUsers(Pageable pageable) {
        return usersRepository.findAll(pageable);
    }

    @Override
    @Cacheable(value = "userById", key = "#id")
    public Users getUserById(Long id) {
        if (id <= 0) {
            throw new IllegalArgumentException("Invalid user ID: " + id);
        }
        return this.usersRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("user not found with id: " + id));
    }

    @Override
    @CacheEvict(value = {"users", "userById", "userByEmail", "userTotal", "userBlogHistory"}, allEntries = true)
    public void deleteUserById(long id) {
        // Check existence directly from DB to avoid populating cache right before deleting it
        if (!usersRepository.existsById(id)) {
             throw new NotFoundException("user not found with id: " + id);
        }
        this.usersRepository.deleteById(id);
    }

    @Override
    @CacheEvict(value = {"users", "userById", "userByEmail", "userBlogHistory"}, allEntries = true)
    public Users updateUserById(long id, Users user) {
        // Fetch directly from Repository to avoid modifying the cached instance in-memory before saving
        Users existingUser = usersRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("user not found with id: " + id));

        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }

        if (user.getName() != null) {
            existingUser.setName(user.getName());
        }

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        if (user.getDescription() != null) {
            existingUser.setDescription(user.getDescription());
        }

        if (user.getRole() != null) {
            existingUser.setRole(user.getRole());
        }

        return this.usersRepository.save(existingUser);
    }

    @Override
    @Cacheable(value = "userBlogHistory", key = "#id")
    public Users getUserBlogHistory(long id) {
        // Use the proxy to get cached user
        return self.getUserById(id); // ✅ Now uses cache
    }

    @Override
    @Cacheable(value = "userByEmail", key = "#email")
    public Users getMyInfo(String email) {
        return this.usersRepository.findByEmail(email)
                .orElseThrow(() ->
                        new NotFoundException("user not found with email: " + email));
    }

    @Override
    @Cacheable(value = "userTotal")
    public Integer getUserTotal() {
        return Math.toIntExact(usersRepository.count());
    }
}