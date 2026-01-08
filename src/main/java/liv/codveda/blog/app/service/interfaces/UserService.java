package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.entities.Users;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    List<Users> getAllUsers();

    Users getUserById(Long id);

    void deleteUserById(long id);
    Users updateUserById(long id, Users user);
    Users getUserBlogHistory(long id);
    Users getMyInfo(String email);

}
