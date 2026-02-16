package liv.codveda.blog.app.domain.mapper.impl;

import liv.codveda.blog.app.domain.dto.response.UsersDto;
import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.mapper.interfaces.ReferenceMapper;
import liv.codveda.blog.app.domain.mapper.interfaces.UserMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Optional;


@Component
public class UserMapperImp implements UserMapper {
    private final ReferenceMapper referenceMapper;

    @Autowired
    public UserMapperImp(ReferenceMapper referenceMapper) {
        this.referenceMapper = referenceMapper;
    }

    @Override
    public Users userDtoToUser(UsersDto usersDto) {
        if(usersDto == null) return null;
        Users users = new Users();
        users.setId(usersDto.id());
        users.setName(usersDto.name());
        users.setEmail(usersDto.email());
        users.setDescription(usersDto.description());
        users.setAvatar(usersDto.avatar());
        users.setRole(usersDto.role());
        users.setCreatedAt(usersDto.createdAt());
        users.setUpdatedAt(usersDto.updatedAt());
        return users;
    }

    @Override
    public UsersDto userToUserDto(Users users) {
        if(users == null) return null;
        return new UsersDto(
                users.getId(),
                users.getName(),
                users.getEmail(),
                users.getDescription(),
                users.getAvatar(),
                users.getRole(),
                users.getCreatedAt(),
                users.getUpdatedAt(),
                Optional.ofNullable(users.getPosts())
                        .map(post->post.stream()
                                .map(referenceMapper::toPostReference)
                                .toList()).orElse(null),
                Optional.ofNullable(users.getComments())
                        .map(comments -> comments.stream()
                                .map(referenceMapper::toCommentReference)
                        .toList()).orElse(null)
        );
    }
}
