package com.dance.studio.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.dance.studio.model.Student;
import com.dance.studio.repository.StudentRepository;

@RestController
@RequestMapping("/admin/students")
@CrossOrigin
@SuppressWarnings("null")
public class AdminStudentController {

    private final StudentRepository repo;
    private final com.dance.studio.repository.BatchRepository batchRepo;
    private final com.dance.studio.repository.DanceTypeRepository danceRepo;
    private final com.dance.studio.repository.UserRepository userRepo;

    public AdminStudentController(StudentRepository repo,
            com.dance.studio.repository.BatchRepository batchRepo,
            com.dance.studio.repository.DanceTypeRepository danceRepo,
            com.dance.studio.repository.UserRepository userRepo) {
        this.repo = repo;
        this.batchRepo = batchRepo;
        this.danceRepo = danceRepo;
        this.userRepo = userRepo;
    }

    @PostMapping
    @org.springframework.transaction.annotation.Transactional
    public Student add(@RequestBody Student s) {
        // 1. Check if user already exists (by email or mobile)
        com.dance.studio.model.User user = userRepo.findByEmail(s.getEmail()).orElse(null);
        if (user == null && s.getParentMobile() != null) {
            user = userRepo.findByUsername(s.getParentMobile()).orElse(null);
        }

        if (user == null) {
            // Create new User Record (for login)
            user = new com.dance.studio.model.User();
            user.setEmail(s.getEmail());
            user.setUsername(s.getEmail());
            user.setPassword(s.getPassword());
            user.setRole(com.dance.studio.model.Role.STUDENT);
            userRepo.save(user);
        } else {
            // User exists, check if this student name is already registered under this identity
            java.util.List<com.dance.studio.model.Student> existingStudents = repo.findByEmailOrParentMobile(s.getEmail(), s.getParentMobile());
            boolean alreadyExists = existingStudents.stream().anyMatch(st -> st.getName().equalsIgnoreCase(s.getName()));
            if (alreadyExists) {
                throw new RuntimeException("This student name is already registered in this family.");
            }
            // If user exists, we allow adding another student profile (account)
        }

        // 2. Link Batch (handle null IDs from frontend)
        if (s.getBatch() != null && s.getBatch().getId() != null) {
            batchRepo.findById(s.getBatch().getId()).ifPresentOrElse(s::setBatch, () -> s.setBatch(null));
        } else {
            s.setBatch(null);
        }

        // 3. Link DanceType
        if (s.getDanceType() != null && s.getDanceType().getId() != null) {
            danceRepo.findById(s.getDanceType().getId()).ifPresentOrElse(s::setDanceType, () -> s.setDanceType(null));
        } else {
            s.setDanceType(null);
        }

        // 4. Default Password if missing
        if (s.getPassword() == null || s.getPassword().trim().isEmpty()) {
            s.setPassword("password123");
        }

        // 5. Save Student
        return repo.save(s);
    }

    @PutMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public Student update(@PathVariable Long id, @RequestBody Student s) {
        return repo.findById(id).map(existing -> {
            String oldEmail = existing.getEmail();
            
            existing.setName(s.getName());
            existing.setAge(s.getAge());
            existing.setParentMobile(s.getParentMobile());
            existing.setAddress(s.getAddress());
            existing.setTaluka(s.getTaluka());
            existing.setDistrict(s.getDistrict());
            existing.setState(s.getState());
            existing.setPincode(s.getPincode());
            existing.setNationality(s.getNationality());
            existing.setParentRelation(s.getParentRelation());
            existing.setSkillLevel(s.getSkillLevel());
            existing.setClassType(s.getClassType());
            existing.setFeePlan(s.getFeePlan());
            existing.setAdmissionFee(s.getAdmissionFee());
            existing.setNotes(s.getNotes());
            existing.setActive(s.isActive());
            existing.setJoiningDate(s.getJoiningDate());
            existing.setProfilePic(s.getProfilePic());
            existing.setRegistrationFeeStatus(s.getRegistrationFeeStatus());
            existing.setTotalOutstanding(s.getTotalOutstanding());
            existing.setEmail(s.getEmail());

            if (s.getPassword() != null && !s.getPassword().trim().isEmpty()) {
                existing.setPassword(s.getPassword());
            }

            // Sync with User table
            userRepo.findByEmail(oldEmail).ifPresent(user -> {
                user.setEmail(existing.getEmail());
                user.setUsername(existing.getEmail()); // Username is email
                user.setPassword(existing.getPassword());
                userRepo.save(user);
            });

            // Link Batch
            if (s.getBatch() != null && s.getBatch().getId() != null) {
                batchRepo.findById(s.getBatch().getId()).ifPresent(existing::setBatch);
            } else {
                existing.setBatch(null);
            }
            // Link DanceType
            if (s.getDanceType() != null && s.getDanceType().getId() != null) {
                danceRepo.findById(s.getDanceType().getId()).ifPresent(existing::setDanceType);
            }

            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @DeleteMapping("/{id}")
    @org.springframework.transaction.annotation.Transactional
    public void delete(@PathVariable Long id) {
        repo.findById(id).ifPresent(s -> {
            userRepo.findByEmail(s.getEmail()).ifPresent(userRepo::delete);
            repo.delete(s);
        });
    }

    @GetMapping
    public List<Student> all() {
        return repo.findAll();
    }

    @GetMapping("/{id}")
    public Student getById(@PathVariable Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Student not found"));
    }

    @GetMapping("/batch/{batchId}")
    public List<Student> getByBatch(@PathVariable Long batchId) {
        return repo.findByBatchId(batchId);
    }

    @GetMapping("/family")
    public List<Student> getFamily(@RequestParam(required = false) String email, @RequestParam(required = false) String mobile) {
        return repo.findByEmailOrParentMobile(email, mobile);
    }
}
