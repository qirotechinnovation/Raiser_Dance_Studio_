package com.dance.studio.controller;

import com.dance.studio.model.SangeetInquiry;
import com.dance.studio.model.SangeetPackage;
import com.dance.studio.model.Student;
import com.dance.studio.repository.SangeetInquiryRepository;
import com.dance.studio.repository.SangeetPackageRepository;
import com.dance.studio.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/student/sangeet")
@CrossOrigin
public class StudentSangeetController {

    private final SangeetPackageRepository packageRepo;
    private final StudentRepository studentRepo;
    private final SangeetInquiryRepository inquiryRepo;

    public StudentSangeetController(SangeetPackageRepository packageRepo,
            StudentRepository studentRepo,
            SangeetInquiryRepository inquiryRepo) {
        this.packageRepo = packageRepo;
        this.studentRepo = studentRepo;
        this.inquiryRepo = inquiryRepo;
    }

    @GetMapping
    public List<SangeetPackage> all() {
        return packageRepo.findAll();
    }

    @PostMapping("/book")
    public SangeetInquiry book(@RequestBody Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long packageId = Long.valueOf(body.get("packageId").toString());
        String eventDateStr = body.get("eventDate").toString();

        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        SangeetPackage pkg = packageRepo.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Package not found"));

        SangeetInquiry inquiry = new SangeetInquiry();
        inquiry.setStudent(student);
        inquiry.setPackageOfInterest(pkg);
        inquiry.setClientName(student.getName());
        inquiry.setMobile(student.getParentMobile());
        inquiry.setEventDate(LocalDate.parse(eventDateStr));
        inquiry.setStatus("PENDING");
        inquiry.setPaymentStatus("UNPAID");

        if (body.containsKey("brideName"))
            inquiry.setBrideName(body.get("brideName").toString());
        if (body.containsKey("groomName"))
            inquiry.setGroomName(body.get("groomName").toString());

        return inquiryRepo.save(inquiry);
    }

    @PostMapping("/{id}/upload-receipt")
    public SangeetInquiry uploadReceipt(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        SangeetInquiry inquiry = inquiryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }

        try {
            // Ensure directory exists
            String uploadDir = "uploads/sangeet/";
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Save file
            String filename = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath);

            // Update Inquiry
            inquiry.setPaymentProof(filename);
            inquiry.setPaymentStatus("VERIFICATION_PENDING");
            return inquiryRepo.save(inquiry);

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file " + e.getMessage());
        }
    }

    @GetMapping("/{studentId}/my-inquiries")
    public List<SangeetInquiry> getMyInquiries(@PathVariable Long studentId) {
        return inquiryRepo.findByStudentId(studentId);
    }
}
