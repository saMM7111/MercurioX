package com.northwind.auth.seed;

import com.northwind.auth.entity.Role;
import com.northwind.auth.entity.User;
import com.northwind.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoUserSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final boolean seedEnabled;
    private final String demoPassword;

    public DemoUserSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.seed-demo-users:false}") boolean seedEnabled,
            @Value("${app.demo-password:Passw0rd!}") String demoPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.seedEnabled = seedEnabled;
        this.demoPassword = demoPassword;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }

        seedUser("admin", "admin@northwind.local", Role.ADMIN);
        seedUser("manager", "manager@northwind.local", Role.MANAGER);
        seedUser("viewer", "viewer@northwind.local", Role.VIEWER);
    }

    private void seedUser(String username, String email, Role role) {
        if (userRepository.existsByUsername(username) || userRepository.existsByEmail(email)) {
            return;
        }
        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(demoPassword));
        user.setRole(role);
        user.setEnabledFlag(true);
        userRepository.save(user);
    }
}
