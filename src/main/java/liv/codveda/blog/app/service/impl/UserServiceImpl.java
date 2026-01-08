package liv.codveda.blog.app.service.impl;

import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.exception.NotFoundException;
import liv.codveda.blog.app.repository.UsersRepository;
import liv.codveda.blog.app.service.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private final UsersRepository usersRepository;

    @Autowired
    public UserServiceImpl(UsersRepository usersRepository) {
        this.usersRepository = usersRepository;
    }

    @Override
    public List<Users> getAllUsers() {
        return usersRepository.findAll(Sort.by(Sort.Direction.DESC,"userId"));
    }



    @Override
    public Users getUserById(Long id) {
        if ( id <= 0) {
            throw new IllegalArgumentException("Invalid user ID: " + id);
        }
        return this.usersRepository.findById(Math.toIntExact(id))
                .orElseThrow(() -> new NotFoundException("user not found with id: " + id));
    }

    @Override
    public void deleteUserById(long id) {

    }

    @Override
    public Users updateUserById(long id, Users user) {
        return null;
    }

    @Override
    public Users getUserBookingsHistory(long id) {
        return null;
    }

    @Override
    public Users getMyInfo(String email) {
        return null;
    }
}
