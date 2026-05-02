package com.dance.studio.controller;

import com.dance.studio.model.Role;
import com.dance.studio.model.User;
import com.dance.studio.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin
public class AuthController {

    private final com.dance.studio.repository.StudentRepository studentRepo;
    private final com.dance.studio.repository.UserRepository userRepo;
    private final com.dance.studio.repository.AdminRepository adminRepo;
    private final com.dance.studio.repository.NotificationRepository notificationRepo; // Injected
    private final UserService userService;

    public AuthController(UserService userService, com.dance.studio.repository.StudentRepository studentRepo,
            com.dance.studio.repository.UserRepository userRepo,
            com.dance.studio.repository.AdminRepository adminRepo,
            com.dance.studio.repository.NotificationRepository notificationRepo) {
        this.userService = userService;
        this.studentRepo = studentRepo;
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
        this.notificationRepo = notificationRepo;
    }

    // 🔐 LOGIN (Admin & Student)
    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> credentials) {

        String email = credentials.get("email");
        String password = credentials.get("password");

        Map<String, Object> response = new HashMap<>();

        User user = userService.login(email, password);

        if (user == null) {
            response.put("success", false);
            response.put("message", "Invalid email or password");
        } else {
            response.put("success", true);
            response.put("user", user);
            response.put("role", user.getRole()); // ADMIN or STUDENT
            response.put("message", "Login successful");

            // IF Student, find Student Entity ID
            if (user.getRole() == Role.STUDENT) {
                java.util.List<com.dance.studio.model.Student> students = studentRepo.findByEmail(email);
                
                if (students.size() > 1) {
                    response.put("multipleProfiles", true);
                    response.put("profiles", students);
                    return response;
                } else if (!students.isEmpty()) {
                    com.dance.studio.model.Student student = students.get(0);
                    // Check active status
                    if (!student.isActive()) {
                        response.put("success", false);
                        response.put("message", "Account Inactive. Please contact Admin.");
                        response.remove("user"); // Clear user data
                        response.remove("role");
                        return response;
                    }
                    response.put("studentId", student.getId());
                    response.put("feeStatus", student.getRegistrationFeeStatus()); // Send Status to frontend
                }
            } else if (user.getRole() == Role.ADMIN) {
                adminRepo.findByEmail(email).ifPresent(admin -> {
                    response.put("adminId", admin.getId());
                });
            }
        }

        return response;
    }

    // 🛡️ ADMIN REGISTRATION (Only by existing Admins ideally)
    @PostMapping("/register/admin")
    public Map<String, Object> registerAdmin(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String name = (String) payload.get("name");
            String email = (String) payload.get("email");
            String password = (String) payload.get("password");

            if (userRepo.findByEmail(email).isPresent()) {
                response.put("success", false);
                response.put("message", "Email already in use");
                return response;
            }

            // 1. Create User
            User user = new User();
            user.setUsername(email);
            user.setEmail(email);
            user.setPassword(password);
            user.setRole(Role.ADMIN);
            userService.save(user);

            // 2. Create Admin Profile
            com.dance.studio.model.Admin admin = new com.dance.studio.model.Admin();
            admin.setName(name);
            admin.setEmail(email);
            admin.setPassword(password);
            admin.setRole(Role.ADMIN);
            adminRepo.save(admin);

            response.put("success", true);
            response.put("message", "Admin registered successfully");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Admin registration failed: " + e.getMessage());
        }
        return response;
    }

    // 🧑‍🎓 STUDENT SELF REGISTRATION
    @PostMapping("/register")
    @org.springframework.transaction.annotation.Transactional
    public Map<String, Object> register(@RequestBody Map<String, Object> payload) {

        Map<String, Object> response = new HashMap<>();

        try {
            String name = (String) payload.get("name");
            String email = (String) payload.get("email");
            String password = (String) payload.get("password");
            String parentMobile = (String) payload.get("parentMobile");
            Integer age = payload.get("age") != null ? ((Number) payload.get("age")).intValue() : 0;

            // 1. Check if user already exists
            User user = userRepo.findByEmail(email).orElse(null);
            
            if (user == null) {
                // Create new User
                user = new User(null, email, password, Role.STUDENT);
                user.setEmail(email);
                user.setUsername(email);
                user = userService.save(user);
            } else {
                // User exists, but check if this student name is already registered under this email
                java.util.List<com.dance.studio.model.Student> existingStudents = studentRepo.findByEmail(email);
                boolean alreadyExists = existingStudents.stream().anyMatch(s -> s.getName().equalsIgnoreCase(name));
                if (alreadyExists) {
                    response.put("success", false);
                    response.put("message", "This student name is already registered with this email.");
                    return response;
                }
                // If user exists, we allow adding another student profile (account)
            }
            User savedUser = user;

            // 3. Create Student (Profile)
            com.dance.studio.model.Student student = new com.dance.studio.model.Student();
            student.setName(name);
            student.setEmail(email);
            student.setPassword(password); // redundant but in model
            student.setAge(age);
            student.setParentMobile(parentMobile);
            student.setAddress((String) payload.get("address"));
            student.setTaluka((String) payload.get("taluka"));
            student.setDistrict((String) payload.get("district"));
            student.setState((String) payload.get("state"));
            student.setPincode((String) payload.get("pincode"));
            student.setNationality((String) payload.get("nationality"));
            student.setParentRelation((String) payload.get("parentRelation"));
            student.setTotalOutstanding(0.0); // Initial outstanding is zero
            student.setActive(true);
            student.setJoiningDate(java.time.LocalDate.now());

            studentRepo.save(student);

            response.put("success", true);
            response.put("user", savedUser);
            response.put("message", "Student registered successfully");
        } catch (Exception e) {
            e.printStackTrace();
            response.put("success", false);
            response.put("message", "Registration failed: " + e.getMessage());
        }

        return response;
    }

    // 🔄 CHANGE PASSWORD
    @PostMapping("/change-password")
    public Map<String, Object> changePassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String email = request.get("email");
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");

        User user = userService.login(email, oldPassword);
        if (user == null) {
            response.put("success", false);
            response.put("message", "Incorrect old password");
        } else {
            user.setPassword(newPassword);
            userService.save(user);

            // Sync with profile if it exists
            studentRepo.findByEmail(email).forEach(s -> {
                s.setPassword(newPassword);
                studentRepo.save(s);
            });
            adminRepo.findByEmail(email).ifPresent(a -> {
                a.setPassword(newPassword);
                adminRepo.save(a);
            });

            response.put("success", true);
            response.put("message", "Password updated successfully");
        }
        return response;
    }

    // ❓ FORGOT PASSWORD (Simple Mock)
    @PostMapping("/forgot-password")
    public Map<String, Object> forgotPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        String email = request.get("email");

        if (userRepo.findByEmail(email).isPresent()) {
            // In a real app, send email with OTP/Token
            response.put("success", true);
            response.put("message", "Reset instructions sent to " + email);
        } else {
            response.put("success", false);
            response.put("message", "Email not found");
        }
        return response;
    }

    // 📋 NEW REGISTRATIONS (Students with no batch)
    @GetMapping("/new-registrations")
    public java.util.List<com.dance.studio.model.Student> getNewRegistrations() {
        return studentRepo.findByBatchIsNull();
    }

    // 🔔 REQUEST ACTIVATION (When inactive student tries to login)
    @PostMapping("/request-activation")
    public Map<String, Object> requestActivation(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            String message = request.get("message");

            // Log the activation request
            System.out.println("=== ACTIVATION REQUEST ===");
            System.out.println("Email: " + email);
            System.out.println("Message: " + message);

            // Save Notification to DB
            com.dance.studio.model.Notification notif = new com.dance.studio.model.Notification();
            notif.setType("ACTIVATION");
            notif.setMessage(message != null ? message : "Request for activation");
            notif.setTimestamp(java.time.LocalDateTime.now());

            java.util.List<com.dance.studio.model.Student> students = studentRepo.findByEmail(email);
            if (!students.isEmpty()) {
                notif.setStudent(students.get(0)); // Associate with the first one for now
            }
            notificationRepo.save(notif);

            System.out.println("Timestamp: " + java.time.LocalDateTime.now());
            System.out.println("========================");

            // In production, you could:
            // 1. Send email to admin
            // 2. Create a notification record in database
            // 3. Send push notification to admin app

            response.put("success", true);
            response.put("message", "Activation request sent to admin");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Failed to send request: " + e.getMessage());
        }
        return response;
    }
}
