package com.dance.studio;

import com.dance.studio.model.Role;
import com.dance.studio.model.User;
import com.dance.studio.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class StudioApplication {
    public static void main(String[] args) {
        SpringApplication.run(StudioApplication.class, args);
        System.out.println("Application is Running :- ");
    }
    @Bean
    public CommandLineRunner seedAdmin(UserRepository userRepo, com.dance.studio.repository.AdminRepository adminRepo) {
        return args -> {
            String adminEmail = "admin@studio.com";
            if (userRepo.findByEmail(adminEmail).isEmpty()) {
                // 1. Create Auth User
                User user = new User();
                user.setUsername("admin");
                user.setEmail(adminEmail);
                user.setPassword("admin123");
                user.setRole(Role.ADMIN);
                userRepo.save(user);
                // 2. Create Admin Profile
                com.dance.studio.model.Admin adminProfile = new com.dance.studio.model.Admin();
                adminProfile.setName("Super Admin");
                adminProfile.setEmail(adminEmail);
                adminProfile.setPassword("admin123");
                adminProfile.setRole(Role.ADMIN);
                adminRepo.save(adminProfile);
                System.out.println("Default Admin seeded: admin@studio.com / admin123");
            }
        };
    }
}

