package liv.codveda.blog.app.config;

import liv.codveda.blog.app.domain.entities.Users;
import liv.codveda.blog.app.domain.enums.Roles;
import liv.codveda.blog.app.repository.UsersRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class DefaultAdminInitializer implements CommandLineRunner {

    private final UsersRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.name}")
    private String adminUsername;


    public DefaultAdminInitializer(UsersRepository usersRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        createDefaultAdminIfNotExists();
    }

    private void createDefaultAdminIfNotExists() {
        if (!userRepository.existsByEmail(adminEmail)) {
            Users adminUser = Users.builder()
                    .name(adminUsername)
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Roles.ADMIN)
                    .build();

            userRepository.save(adminUser);
            log.info("Default admin user created successfully!");
        } else {
            log.info("Admin Manager user already exists");
        }
    }
}
