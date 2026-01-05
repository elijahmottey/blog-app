package liv.codveda.blog.app.domain.mapper.interfaces;

import liv.codveda.blog.app.domain.dto.response.UsersDto;
import liv.codveda.blog.app.domain.entities.Users;

public interface UserMapper {
    Users userDtoToUser(UsersDto usersDto);
    UsersDto userToUserDto(Users users);
}
