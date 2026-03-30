package com.dance.studio.controller;

import com.dance.studio.model.Batch;
import com.dance.studio.model.BatchEnrollmentInquiry;
import com.dance.studio.model.Student;
import com.dance.studio.repository.BatchEnrollmentRepository;
import com.dance.studio.repository.BatchRepository;
import com.dance.studio.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student/batch")
@CrossOrigin
public class StudentBatchEnrollmentController {

    private final BatchEnrollmentRepository enrollmentRepo;
    private final BatchRepository batchRepo;
    private final StudentRepository studentRepo;

    public StudentBatchEnrollmentController(
            BatchEnrollmentRepository enrollmentRepo,
            BatchRepository batchRepo,
            StudentRepository studentRepo) {
        this.enrollmentRepo = enrollmentRepo;
        this.batchRepo = batchRepo;
        this.studentRepo = studentRepo;
    }

    // ✅ GET AVAILABLE BATCHES
    @GetMapping("/available")
    public List<Batch> getAvailableBatches() {
        return batchRepo.findByActive(true);
    }

    // ✅ SUBMIT ENROLLMENT INQUIRY
    @PostMapping("/enroll")
    public Map<String, Object> submitEnrollment(@RequestBody Map<String, Object> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Long studentId = Long.parseLong(request.get("studentId").toString());
            Long batchId = Long.parseLong(request.get("batchId").toString());
            String message = request.get("message").toString();
            String planType = request.containsKey("planType") ? request.get("planType").toString() : "MONTHLY";

            Student student = studentRepo.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));
            Batch batch = batchRepo.findById(batchId)
                    .orElseThrow(() -> new RuntimeException("Batch not found"));

            BatchEnrollmentInquiry inquiry = new BatchEnrollmentInquiry();
            inquiry.setStudent(student);
            inquiry.setBatch(batch);
            inquiry.setMessage(message);
            inquiry.setPlanType(planType);
            inquiry.setStatus("PENDING");

            enrollmentRepo.save(inquiry);

            response.put("success", true);
            response.put("message", "Enrollment request submitted successfully");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    // ✅ GET STUDENT'S INQUIRIES
    @GetMapping("/{studentId}/inquiries")
    public List<BatchEnrollmentInquiry> getStudentInquiries(@PathVariable Long studentId) {
        return enrollmentRepo.findByStudentIdOrderByTimestampDesc(studentId);
    }
}
