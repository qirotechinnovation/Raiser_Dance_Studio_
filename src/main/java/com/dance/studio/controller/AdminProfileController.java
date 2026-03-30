package com.dance.studio.controller;

import com.dance.studio.model.User;
import com.dance.studio.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin
public class AdminProfileController {

    private final UserRepository userRepo;
    private final com.dance.studio.repository.AdminRepository adminRepo;

    public AdminProfileController(UserRepository userRepo, com.dance.studio.repository.AdminRepository adminRepo) {
        this.userRepo = userRepo;
        this.adminRepo = adminRepo;
    }

    // ✅ GET ALL ADMINS (with passwords per request)
    @GetMapping("/all-admins")
    public java.util.List<com.dance.studio.model.Admin> getAllAdmins() {
        return adminRepo.findAll();
    }

    // ✅ VIEW ADMIN PROFILE
    @GetMapping("/{id}/profile")
    public Map<String, Object> getProfile(@PathVariable Long id) {
        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("username", user.getUsername());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("profilePic", user.getAvatar());

        return profile;
    }

    // ✅ UPLOAD PROFILE PIC
    @PostMapping("/{id}/upload-profile-pic")
    public ResponseEntity<String> uploadProfilePic(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is missing");
        }

        User user = userRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        try {
            String uploadDir = System.getProperty("user.dir")
                    + File.separator + "uploads"
                    + File.separator + "profiles";

            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String rawName = file.getOriginalFilename();
            String originalName = (rawName != null) ? rawName : "profile";
            String fileName = "admin_" + user.getId() + "_" + System.currentTimeMillis()
                    + "_" + originalName.replaceAll("\\s+", "_");

            File destination = new File(dir, fileName);
            file.transferTo(destination);

            user.setAvatar(fileName);
            userRepo.save(user);

            return ResponseEntity.ok(fileName);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Upload failed: " + e.getMessage());
        }
    }
}
