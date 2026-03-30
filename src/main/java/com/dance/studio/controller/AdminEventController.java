package com.dance.studio.controller;

import com.dance.studio.model.Event;
import com.dance.studio.model.Student;
import com.dance.studio.repository.EventRepository;
import com.dance.studio.repository.StudentRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.List;

@RestController
@RequestMapping("/admin/events")
@CrossOrigin
@SuppressWarnings("null")
public class AdminEventController {

    private final EventRepository eventRepo;
    private final StudentRepository studentRepo;
    private final com.dance.studio.repository.EventInquiryRepository inquiryRepo;
    private final com.dance.studio.repository.NotificationRepository notificationRepo;
    private final com.dance.studio.repository.EventCancellationRepository cancellationRepo;
    private final com.dance.studio.repository.FeeRepository feeRepo;

    public AdminEventController(EventRepository eventRepo,
            StudentRepository studentRepo,
            com.dance.studio.repository.EventInquiryRepository inquiryRepo,
            com.dance.studio.repository.NotificationRepository notificationRepo,
            com.dance.studio.repository.EventCancellationRepository cancellationRepo,
            com.dance.studio.repository.FeeRepository feeRepo) {
        this.eventRepo = eventRepo;
        this.studentRepo = studentRepo;
        this.inquiryRepo = inquiryRepo;
        this.notificationRepo = notificationRepo;
        this.cancellationRepo = cancellationRepo;
        this.feeRepo = feeRepo;
    }

    // ✅ CREATE EVENT
    @PostMapping
    public Event create(@RequestBody Event event) {
        Event saved = eventRepo.save(event);

        System.out.println("📢 New Event Created: " + saved.getTitle());

        // 🔔 PUBLIC NOTIFICATION (New Event Announcement)
        try {
            com.dance.studio.model.Notification notif = new com.dance.studio.model.Notification();
            notif.setType("NEW_EVENT");
            notif.setStudent(null); // ✅ Public Notification (for all)
            notif.setMessage(
                    "🎉 New Event: " + saved.getTitle() + " on " + saved.getDate() + ". Check it out!");
            notif.setTimestamp(java.time.LocalDateTime.now());

            notificationRepo.save(notif);
            System.out.println("🔔 Posted public new event announcement");
        } catch (Exception e) {
            System.err.println("Failed to send event notifications: " + e.getMessage());
        }

        return saved;
    }

    @PostMapping("/{id}/upload-photo")
    public ResponseEntity<String> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body("File is missing");
        }

        Event event = eventRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        try {
            // ✅ ABSOLUTE & SAFE PATH
            String uploadDir = System.getProperty("user.dir")
                    + File.separator + "uploads"
                    + File.separator + "events";

            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }

            // 🔒 SAFE FILE NAME
            String originalName = file.getOriginalFilename();
            String safeName = (originalName != null) ? originalName.replaceAll("\\s+", "_") : "event_photo.jpg";
            String fileName = System.currentTimeMillis() + "_" + safeName;

            File destination = new File(dir, fileName);
            file.transferTo(destination);

            event.setPhoto(fileName);
            eventRepo.save(event);

            return ResponseEntity.ok("Photo uploaded successfully");

        } catch (Exception e) {
            e.printStackTrace(); // 👈 CHECK CONSOLE
            return ResponseEntity.internalServerError()
                    .body("Upload failed: " + e.getMessage());
        }
    }

    // 👨‍🎓 ADD PARTICIPANTS
    @PostMapping("/{eventId}/participants")
    public Event addParticipants(@PathVariable Long eventId,
            @RequestBody List<Long> studentIds) {

        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<Student> students = studentRepo.findAllById(studentIds);
        event.setParticipants(students);

        // 🔔 Notify participants
        students.forEach(s -> System.out.println("📢 Student " + s.getName()
                + " added to event " + event.getTitle()));

        return eventRepo.save(event);
    }

    // 📋 GET ALL EVENTS
    @GetMapping
    public List<Event> all() {
        return eventRepo.findAll();
    }

    // ✏️ UPDATE EVENT
    @PutMapping("/{id}")
    public Event update(@PathVariable long id, @RequestBody Event updated) {
        return eventRepo.findById(id).map(existing -> {
            existing.setTitle(updated.getTitle());
            existing.setVenue(updated.getVenue());
            existing.setDate(updated.getDate());
            existing.setTime(updated.getTime());
            existing.setType(updated.getType());
            existing.setDescription(updated.getDescription());
            existing.setPhoto(updated.getPhoto());
            return eventRepo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    // 🗑️ DELETE EVENT (CANCEL EVENT)
    @DeleteMapping("/{id}")
    public void delete(@PathVariable long id) {
        Event event = eventRepo.findById(id).orElseThrow(() -> new RuntimeException("Event not found"));

        // 🔔 Notify participants before deletion
        List<Student> participants = event.getParticipants();
        if (participants != null && !participants.isEmpty()) {
            for (Student student : participants) {
                try {
                    com.dance.studio.model.Notification notif = new com.dance.studio.model.Notification();
                    notif.setType("EVENT_CANCELLED");
                    notif.setMessage(
                            "⚠️ Important: The event '" + event.getTitle() + "' scheduled for " + event.getDate()
                                    + " has been CANCELLED.");
                    notif.setStudent(student);
                    notif.setTimestamp(java.time.LocalDateTime.now());
                    notif.setRead(false);
                    notificationRepo.save(notif);
                    System.out.println("📢 Cancel notification sent to: " + student.getName());
                } catch (Exception e) {
                    System.err.println("Failed to notify student " + student.getId() + ": " + e.getMessage());
                }
            }
        }

        eventRepo.deleteById(id);
        System.out.println("🗑️ Event deleted: " + event.getTitle());
    }

    // ✅ INQUIRY MANAGEMENT
    @GetMapping("/inquiries")
    public List<com.dance.studio.model.EventInquiry> getAllInquiries() {
        return inquiryRepo.findAll();
    }

    @PutMapping("/inquiry/{id}/status")
    public com.dance.studio.model.EventInquiry updateInquiryStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        com.dance.studio.model.EventInquiry inquiry = inquiryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setStatus(status);

        // ✅ If Verified/Confirmed, Add Student to Event Participants
        if ("CONFIRMED".equalsIgnoreCase(status)) {
            Event event = inquiry.getEvent();
            Student student = inquiry.getStudent();

            if (!event.getParticipants().contains(student)) {
                event.getParticipants().add(student);
                eventRepo.save(event);
                System.out.println("✅ Student " + student.getName() + " auto-added to event " + event.getTitle());
            }

            // 🔔 Create Notification for Student
            com.dance.studio.model.Notification notification = new com.dance.studio.model.Notification();
            notification.setType("EVENT_CONFIRMED");
            notification.setMessage(
                    "Your booking for '" + event.getTitle() + "' has been confirmed! Event Date: " + event.getDate());
            notification.setStudent(student);
            notification.setTimestamp(java.time.LocalDateTime.now());
            notification.setRead(false);
            notificationRepo.save(notification);
            System.out.println("🔔 Notification sent to " + student.getName() + " for event confirmation");

            // 💰 Create Fee Record for Financial History
            try {
                com.dance.studio.model.Fee fee = new com.dance.studio.model.Fee();
                fee.setStudent(student);
                fee.setAmount(event.getFee() != null ? event.getFee() : 0.0);
                fee.setPaidDate(java.time.LocalDate.now());
                fee.setDueDate(java.time.LocalDate.now());
                fee.setStatus("PAID");
                fee.setPaymentMode("ONLINE");
                fee.setPlan("Event: " + event.getTitle());
                fee.setRemarks("Event booking confirmed via inquiry #" + inquiry.getId());
                feeRepo.save(fee);
                System.out.println("💰 Fee record created for event payment: " + event.getTitle());
            } catch (Exception e) {
                System.err.println("Failed to create fee record for event: " + e.getMessage());
            }
        }

        return inquiryRepo.save(inquiry);
    }

    // ❌ CANCELLATION REQUESTS
    @GetMapping("/cancellations")
    public List<com.dance.studio.model.EventCancellationRequest> getAllCancellations() {
        return cancellationRepo.findAll();
    }

    @PostMapping("/cancellations/{id}/action")
    public ResponseEntity<java.util.Map<String, Object>> handleCancellationAction(
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {

        String action = body.get("action");
        java.util.Map<String, Object> res = new java.util.HashMap<>();

        try {
            com.dance.studio.model.EventCancellationRequest req = cancellationRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Request not found"));

            if ("APPROVE".equalsIgnoreCase(action)) {
                req.setStatus("APPROVED");

                // Remove student from event
                Event event = req.getEvent();
                Student student = req.getStudent();

                if (event.getParticipants().contains(student)) {
                    event.getParticipants().remove(student);
                    eventRepo.save(event);
                }

            } else if ("DECLINE".equalsIgnoreCase(action)) {
                req.setStatus("DECLINED");
            }

            cancellationRepo.save(req);
            res.put("success", true);
            return ResponseEntity.ok(res);

        } catch (Exception e) {
            res.put("success", false);
            res.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(res);
        }
    }
}
