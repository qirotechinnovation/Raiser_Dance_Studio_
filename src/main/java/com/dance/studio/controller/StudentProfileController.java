package com.dance.studio.controller;

import com.dance.studio.model.Student;
import com.dance.studio.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/student")
@CrossOrigin
@SuppressWarnings("null")
public class StudentProfileController {

    private final StudentRepository studentRepo;

    public StudentProfileController(StudentRepository studentRepo) {
        this.studentRepo = studentRepo;
    }

    // ✅ MY PROFILE
    @GetMapping("/{id}/profile")
    public Map<String, Object> myProfile(@PathVariable Long id) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        Map<String, Object> profile = new HashMap<>();

        // 🔹 Basic Details
        profile.put("studentId", student.getId());
        profile.put("name", student.getName());
        profile.put("age", student.getAge());
        profile.put("email", student.getEmail()); // ✅ added
        profile.put("active", student.isActive());

        // 🔹 Admission Info
        profile.put("admissionDate", student.getJoiningDate() != null ? student.getJoiningDate().toString() : "N/A");
        profile.put("admissionFee", student.getAdmissionFee());

        // 🔹 Contact Details
        profile.put("mobile", student.getParentMobile() != null ? student.getParentMobile() : "N/A");
        profile.put("address", student.getAddress());

        // 🔹 Dance Details
        profile.put("danceType",
                student.getDanceType() != null
                        ? student.getDanceType().getName()
                        : null);

        profile.put("skillLevel", student.getSkillLevel() != null ? student.getSkillLevel() : "Beginner");
        profile.put("classType", student.getClassType() != null ? student.getClassType() : "General");

        // 🔹 Training Plan
        profile.put("trainPlan",
                student.getSkillLevel() != null ? student.getSkillLevel() + " training plan" : "Standard Plan");

        // 🔹 Avatar
        profile.put("profilePic", student.getProfilePic());

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

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        try {
            String uploadDir = System.getProperty("user.dir")
                    + File.separator + "uploads"
                    + File.separator + "profiles";

            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String safeName = (originalName != null) ? originalName.replaceAll("\\s+", "_") : "profile.jpg";
            String fileName = "profile_" + student.getId() + "_" + System.currentTimeMillis() + "_" + safeName;

            File destination = new File(dir, fileName);
            file.transferTo(destination);

            student.setProfilePic(fileName);
            studentRepo.save(student);

            return ResponseEntity.ok(fileName);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError()
                    .body("Upload failed: " + e.getMessage());
        }
    }
}
