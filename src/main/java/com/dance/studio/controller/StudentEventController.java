package com.dance.studio.controller;

import com.dance.studio.model.Event;
import com.dance.studio.repository.EventInquiryRepository;
import com.dance.studio.repository.EventRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/student/events")
@CrossOrigin
@SuppressWarnings("null")
public class StudentEventController {
    private final EventInquiryRepository inquiryRepo;
    private final EventRepository eventRepo;
    private final com.dance.studio.repository.StudentRepository studentRepo;
    private final com.dance.studio.repository.EventCancellationRepository cancellationRepo;

    public StudentEventController(EventInquiryRepository inquiryRepo,
            EventRepository eventRepo,
            com.dance.studio.repository.StudentRepository studentRepo,
            com.dance.studio.repository.EventCancellationRepository cancellationRepo) {
        this.inquiryRepo = inquiryRepo;
        this.eventRepo = eventRepo;
        this.studentRepo = studentRepo;
        this.cancellationRepo = cancellationRepo;
    }

    @PostMapping("/enquire")
    public java.util.Map<String, Object> submitInquiry(@RequestBody java.util.Map<String, Object> payload) {
        try {
            Long eventId = Long.parseLong(payload.get("eventId").toString());
            Long studentId = Long.parseLong(payload.get("studentId").toString());
            String message = (String) payload.get("message");

            // Check for existing active inquiries
            java.util.List<com.dance.studio.model.EventInquiry> existing = inquiryRepo
                    .findByStudentIdAndEventId(studentId, eventId);
            boolean alreadyEnquired = existing.stream()
                    .anyMatch(inq -> !inq.getStatus().equalsIgnoreCase("REJECTED"));

            if (alreadyEnquired) {
                return java.util.Map.of("success", false, "message",
                        "You have already enquired about this event. Check 'My Inquiries'.");
            }

            com.dance.studio.model.EventInquiry inquiry = new com.dance.studio.model.EventInquiry();
            inquiry.setEvent(eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found")));
            inquiry.setStudent(
                    studentRepo.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found")));
            inquiry.setMessage(message);
            inquiry.setStatus("PENDING");
            inquiry.setTimestamp(java.time.LocalDateTime.now());
            inquiryRepo.save(inquiry);

            return java.util.Map.of("success", true, "message", "Inquiry sent successfully!");
        } catch (Exception e) {
            e.printStackTrace();
            return java.util.Map.of("success", false, "message", "Error: " + e.getMessage());
        }
    }

    @GetMapping("/upcoming")
    public List<Event> getUpcomingEvents() {
        return eventRepo.findByDateGreaterThanEqualOrderByDateAsc(LocalDate.now());
    }

    @GetMapping("/{studentId}/inquiries")
    public List<com.dance.studio.model.EventInquiry> getMyInquiries(@PathVariable Long studentId) {
        return inquiryRepo.findByStudentIdOrderByTimestampDesc(studentId);
    }

    @GetMapping("/{studentId}/booked")
    public List<Event> getMyBookedEvents(@PathVariable Long studentId) {
        return eventRepo.findByParticipantsId(studentId);
    }

    @PostMapping("/inquiry/{id}/upload-receipt")
    public org.springframework.http.ResponseEntity<String> uploadReceipt(
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return org.springframework.http.ResponseEntity.badRequest().body("File is missing");
        }

        com.dance.studio.model.EventInquiry inquiry = inquiryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));

        try {
            String uploadDir = System.getProperty("user.dir")
                    + java.io.File.separator + "uploads"
                    + java.io.File.separator + "events"
                    + java.io.File.separator + "receipts";

            java.io.File dir = new java.io.File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            String originalName = file.getOriginalFilename();
            String fileName = "receipt_" + id + "_" + System.currentTimeMillis() + "_"
                    + (originalName != null ? originalName.replaceAll("\\s+", "_") : "receipt.jpg");
            java.io.File destination = new java.io.File(dir, fileName);
            file.transferTo(destination);

            inquiry.setReceiptPhoto(fileName);
            inquiry.setStatus("PAID");
            inquiryRepo.save(inquiry);

            return org.springframework.http.ResponseEntity.ok("Receipt uploaded successfully");
        } catch (Exception e) {
            return org.springframework.http.ResponseEntity.internalServerError()
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // ✅ CANCEL BOOKING
    // ✅ GET MY CANCELLATION REQUESTS
    @GetMapping("/{studentId}/cancellations")
    public java.util.List<com.dance.studio.model.EventCancellationRequest> getMyCancellations(
            @PathVariable Long studentId) {
        return cancellationRepo.findByStudentId(studentId);
    }

    // ✅ REQUEST CANCELLATION
    @PostMapping("/cancel-request")
    public java.util.Map<String, Object> requestCancellation(@RequestBody java.util.Map<String, Object> payload) {
        try {
            Long eventId = Long.parseLong(payload.get("eventId").toString());
            Long studentId = Long.parseLong(payload.get("studentId").toString());
            String reason = (String) payload.getOrDefault("reason", "No reason provided");

            Event event = eventRepo.findById(eventId).orElseThrow(() -> new RuntimeException("Event not found"));
            com.dance.studio.model.Student student = studentRepo.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            // CHECK 24-HOUR RULE
            long hoursDifference = java.time.temporal.ChronoUnit.HOURS.between(java.time.LocalDateTime.now(),
                    event.getDate().atStartOfDay());
            if (hoursDifference < 24) {
                return java.util.Map.of("success", false, "message", "Cannot cancel less than 24 hours before event.");
            }

            // CHECK IF ALREADY REQUESTED
            java.util.List<com.dance.studio.model.EventCancellationRequest> existing = cancellationRepo
                    .findByStudentIdAndEventId(studentId, eventId);
            if (!existing.isEmpty() && !existing.get(0).getStatus().equals("DECLINED")) {
                return java.util.Map.of("success", false, "message",
                        "Cancellation request already pending or approved.");
            }

            // CREATE REQUEST
            com.dance.studio.model.EventCancellationRequest request = new com.dance.studio.model.EventCancellationRequest();
            request.setEvent(event);
            request.setStudent(student);
            request.setReason(reason);
            request.setStatus("PENDING");
            cancellationRepo.save(request);

            return java.util.Map.of("success", true, "message", "Cancellation request submitted for approval.");

        } catch (Exception e) {
            e.printStackTrace();
            return java.util.Map.of("success", false, "message", "Error: " + e.getMessage());
        }
    }
}
