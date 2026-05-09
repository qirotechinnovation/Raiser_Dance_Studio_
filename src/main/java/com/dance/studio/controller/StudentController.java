package com.dance.studio.controller;

import com.dance.studio.model.Student;
import com.dance.studio.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("admin/student")
@CrossOrigin
@SuppressWarnings("null")
public class StudentController {

    private final StudentRepository studentRepo;
    private final com.dance.studio.repository.UserRepository userRepo;
    private final com.dance.studio.repository.BatchRepository batchRepo;
    private final com.dance.studio.repository.DanceTypeRepository danceRepo;

    public StudentController(StudentRepository studentRepo,
            com.dance.studio.repository.UserRepository userRepo,
            com.dance.studio.repository.BatchRepository batchRepo,
            com.dance.studio.repository.DanceTypeRepository danceRepo) {
        this.studentRepo = studentRepo;
        this.userRepo = userRepo;
        this.batchRepo = batchRepo;
        this.danceRepo = danceRepo;
    }

    // ✅ ADD STUDENT
    @PostMapping
    @org.springframework.transaction.annotation.Transactional
    public Student addStudent(@RequestBody Student student) {
        // 1. Check if user already exists (by email or mobile)
        com.dance.studio.model.User user = userRepo.findByEmail(student.getEmail()).orElse(null);
        if (user == null && student.getParentMobile() != null) {
            user = userRepo.findByUsername(student.getParentMobile()).orElse(null);
        }

        if (user == null) {
            // 2. Default Password if missing
            if (student.getPassword() == null || student.getPassword().trim().isEmpty()) {
                student.setPassword("password123");
            }

            // 3. Create User Record (for login)
            user = new com.dance.studio.model.User();
            user.setEmail(student.getEmail());
            user.setUsername(student.getEmail());
            user.setPassword(student.getPassword());
            user.setRole(com.dance.studio.model.Role.STUDENT);
            userRepo.save(user);
        } else {
            // User exists, check if this student name is already registered under this email/mobile
            java.util.List<com.dance.studio.model.Student> existingStudents = studentRepo.findByEmailOrParentMobile(student.getEmail(), student.getParentMobile());
            boolean alreadyExists = existingStudents.stream().anyMatch(st -> st.getName().equalsIgnoreCase(student.getName()));
            if (alreadyExists) {
                throw new RuntimeException("This student name is already registered in this family.");
            }
            // If user exists, we allow adding another student profile (account)
        }

        // 4. Save Student
        return studentRepo.save(student);
    }

    // ✅ GET ALL STUDENTS
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    // ✅ GET STUDENT BY ID
    @GetMapping("/{id}")
    public Student getStudent(@PathVariable Long id) {
        return studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));
    }

    // ✅ UPDATE STUDENT
    @PutMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public Student updateStudent(@PathVariable Long id,
            @RequestBody Student student) {

        Student existing = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        String oldEmail = existing.getEmail();

        existing.setName(student.getName());
        existing.setAge(student.getAge());
        existing.setParentMobile(student.getParentMobile());
        existing.setAddress(student.getAddress());
        existing.setSkillLevel(student.getSkillLevel());
        existing.setClassType(student.getClassType());
        existing.setActive(student.isActive());
        existing.setEmail(student.getEmail());

        if (student.getPassword() != null && !student.getPassword().trim().isEmpty()) {
            existing.setPassword(student.getPassword());
        }

        // Sync with User table
        userRepo.findByEmail(oldEmail).ifPresent(user -> {
            user.setEmail(existing.getEmail());
            user.setUsername(existing.getEmail());
            user.setPassword(existing.getPassword());
            userRepo.save(user);
        });

        // Link Batch
        if (student.getBatch() != null && student.getBatch().getId() != null) {
            batchRepo.findById(student.getBatch().getId()).ifPresentOrElse(existing::setBatch,
                    () -> existing.setBatch(null));
        } else {
            existing.setBatch(null);
        }

        // Link DanceType
        if (student.getDanceType() != null && student.getDanceType().getId() != null) {
            danceRepo.findById(student.getDanceType().getId()).ifPresentOrElse(existing::setDanceType,
                    () -> existing.setDanceType(null));
        } else {
            existing.setDanceType(null);
        }

        return studentRepo.save(existing);
    }

    // ✅ SOFT DELETE
    @DeleteMapping("/{id}")
    public void deactivateStudent(@PathVariable Long id) {

        Student student = studentRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setActive(false);
        studentRepo.save(student);
    }
}
