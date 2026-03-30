package com.dance.studio.config;

import com.dance.studio.model.*;
import com.dance.studio.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDate;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(UserRepository userRepo,
            DanceTypeRepository danceTypeRepo,
            BatchRepository batchRepo,
            StudentRepository studentRepo,
            FeeRepository feeRepo,
            EventRepository eventRepo) {
        return args -> {
            // 1. Admin
            if (userRepo.findByEmail("admin@dance.com").isEmpty()) {
                User admin = new User();
                admin.setEmail("admin@dance.com");
                admin.setUsername("admin@dance.com");
                admin.setPassword("admin123");
                admin.setRole(Role.ADMIN);
                userRepo.save(admin);
                System.out.println("✅ Default Admin Created: admin@dance.com / admin123");
            }

            // 2. Sample Data (only if database is empty)
            if (danceTypeRepo.count() == 0) {
                // Dance Types
                DanceType d1 = new DanceType();
                d1.setName("Bollywood");
                d1.setActive(true);
                DanceType d2 = new DanceType();
                d2.setName("Hip Hop");
                d2.setActive(true);
                danceTypeRepo.save(d1);
                danceTypeRepo.save(d2);

                System.out.println("✅ Sample Dance Types Created");

                // Batches
                Batch b1 = new Batch();
                b1.setName("Morning Boost");
                b1.setTiming("07:00 AM - 08:00 AM");
                b1.setDays("MONDAY");
                b1.setActive(true);
                b1.setInstructor("Rahul Sir");
                b1.setDanceType(d1);
                b1.setLevel("Beginner");
                batchRepo.save(b1);

                Batch b2 = new Batch();
                b2.setName("Weekend Groove");
                b2.setTiming("05:00 PM - 07:00 PM");
                b2.setDays("SATURDAY");
                b2.setActive(true);
                b2.setInstructor("Simran Mam");
                b2.setDanceType(d2);
                b2.setLevel("Intermediate");
                batchRepo.save(b2);

                System.out.println("✅ Sample Batches Created");

                // Students
                Student s1 = new Student();
                s1.setName("Sarah Jenkins");
                s1.setParentMobile("9876543210");
                s1.setEmail("sarah@test.com");
                s1.setActive(true);
                s1.setJoiningDate(LocalDate.now().minusMonths(2));
                s1.setSkillLevel("Intermediate");
                s1.setBatch(b1);
                s1.setDanceType(d1);
                studentRepo.save(s1);

                Student s2 = new Student();
                s2.setName("Mike Ross");
                s2.setParentMobile("9876541234");
                s2.setEmail("mike@test.com");
                s2.setActive(false); // Inactive to show in stats
                s2.setJoiningDate(LocalDate.now().minusMonths(6));
                s2.setSkillLevel("Beginner");
                s2.setBatch(b2);
                s2.setDanceType(d2);
                studentRepo.save(s2);

                System.out.println("✅ Sample Students Created");

                // Fees
                Fee f1 = new Fee();
                f1.setStudent(s1);
                f1.setAmount(2500.0);
                f1.setStatus("PAID");
                f1.setDueDate(LocalDate.now().minusDays(5));
                f1.setPaidDate(LocalDate.now().minusDays(2));
                f1.setPlan("MONTHLY");
                feeRepo.save(f1);

                Fee f2 = new Fee();
                f2.setStudent(s1); // Same student pending next month or s2
                f2.setAmount(2500.0);
                f2.setStatus("UNPAID");
                f2.setDueDate(LocalDate.now().plusDays(5));
                f2.setPlan("MONTHLY");
                feeRepo.save(f2);

                System.out.println("✅ Sample Fees Created");

                // Event
                Event e1 = new Event();
                e1.setTitle("Summer Dance Showcase");
                e1.setDate(LocalDate.now().plusWeeks(2));
                e1.setType("Showcase");
                e1.setDescription("Annual performance event");
                eventRepo.save(e1);

                System.out.println("✅ Sample Event Created");
            }
        };
    }
}
