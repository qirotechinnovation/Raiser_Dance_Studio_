package com.dance.studio.controller;

import com.dance.studio.model.Notification;
import com.dance.studio.model.Student;
import com.dance.studio.repository.NotificationRepository;
import com.dance.studio.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/admin/notifications")
@CrossOrigin
@SuppressWarnings("null")
public class NotificationController {

    private final NotificationRepository repo;
    private final StudentRepository studentRepo;

    public NotificationController(NotificationRepository repo, StudentRepository studentRepo) {
        this.repo = repo;
        this.studentRepo = studentRepo;
    }

    @GetMapping
    public List<Notification> getAll() {
        // Filter out Fee Reminders as they are for students only
        return repo.findAllByOrderByTimestampDesc().stream()
                .filter(n -> !"FEE_REMINDER".equals(n.getType()))
                .collect(java.util.stream.Collectors.toList());
    }

    @GetMapping("/unread")
    public List<Notification> getUnread() {
        return repo.findByIsReadFalseOrderByTimestampDesc().stream()
                .filter(n -> !"FEE_REMINDER".equals(n.getType()))
                .collect(java.util.stream.Collectors.toList());
    }

    @PutMapping("/{id}/read")
    public void markRead(@PathVariable Long id) {
        repo.findById(id).ifPresent(n -> {
            n.setRead(true);
            repo.save(n);
        });
    }

    @PostMapping("/{id}/approve")
    public Map<String, Object> approveActivation(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Notification n = repo.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));

            if ("ACTIVATION".equals(n.getType()) && n.getStudent() != null) {
                Student s = n.getStudent();
                s.setActive(true);
                studentRepo.save(s);

                n.setRead(true);
                n.setMessage(n.getMessage() + " [APPROVED]"); // Mark as handled in text too
                repo.save(n);

                response.put("success", true);
                response.put("message", "Student activated successfully");
            } else {
                response.put("success", false);
                response.put("message", "Invalid request type or student missing");
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/{id}/reject")
    public Map<String, Object> rejectActivation(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Notification n = repo.findById(id).orElseThrow(() -> new RuntimeException("Notification not found"));
            n.setRead(true); // Mark read
            n.setMessage(n.getMessage() + " [REJECTED]");
            repo.save(n);
            response.put("success", true);
            response.put("message", "Request rejected");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    // ✅ GET STUDENT NOTIFICATIONS
    @GetMapping("/student/{studentId}")
    public List<Notification> getStudentNotifications(@PathVariable Long studentId) {
        return repo.findByStudentIdOrStudentIsNullOrderByTimestampDesc(studentId);
    }

    // ✅ CLEAR ALL NOTIFICATIONS
    @DeleteMapping("/clear-all")
    public String clearAll() {
        repo.deleteAll();
        return "All notifications cleared";
    }
}
