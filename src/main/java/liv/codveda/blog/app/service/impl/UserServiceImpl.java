package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Objects;

@Service
public class UserServiceImpl implements UserService {
    private final UsersRepository usersRepository;

    @Autowired
    public UserServiceImpl(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Override
    @Cacheable(value = "users", key = "#pageable.pageNumber + '-' + #pageable.pageSize")
    public Page<Users> getAllUsers(Pageable pageable) {
        return usersRepository.findAll(pageable);
    }



    @Override
    @Cacheable(value = "userById", key = "#id")
    public Users getUserById(Long id) {
        if ( id <= 0) {
            throw new IllegalArgumentException("Invalid user ID: " + id);
        }
        return this.usersRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("user not found with id: " + id));
    }

    @Override
    @CacheEvict(value = {"users", "userById", "userByEmail"}, allEntries = true)
    public void deleteUserById(long id) {
        this.getUserById(id);
        this.usersRepository.deleteById( id);
    }

    @Override
    @CacheEvict(value = {"users", "userById", "userByEmail"}, allEntries = true)
    public Users updateUserById(long id, Users user) {


        Users existingUser = this.getUserById(id);
        if (user.getEmail() != null) {
            existingUser.setEmail(user.getEmail());
        }

        if (user.getName() != null) {
            existingUser.setName(user.getName());
        }

        if (user.getPassword() != null && !user.getPassword().isEmpty()) {
            existingUser.setPassword(user.getPassword());
        }
        if (user.getRole() != null) {
            existingUser.setRole(user.getRole());
        }

        return this.usersRepository.save(existingUser);
    }

    @Override
    @Cacheable(value = "userBlogHistory", key = "#id")
    public Users getUserBlogHistory(long id) {
        return this.getUserById(id);
    }

    @Override
    @Cacheable(value = "userByEmail", key = "#email")
    public Users getMyInfo(String email) {
        return this.usersRepository.findByEmail(email)
                .orElseThrow(() ->
                        new NotFoundException("user not found with email: " + email));
    }
}
