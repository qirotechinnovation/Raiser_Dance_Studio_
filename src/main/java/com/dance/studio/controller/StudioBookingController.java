package com.dance.studio.controller;

import com.dance.studio.model.StudioBooking;
import com.dance.studio.model.Student;
import com.dance.studio.repository.StudioBookingRepository;
import com.dance.studio.repository.StudentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/studio")
@CrossOrigin(origins = "*")
@SuppressWarnings("null")
public class StudioBookingController {

    private final StudioBookingRepository bookingRepo;
    private final StudentRepository studentRepo;
    private final com.dance.studio.repository.NotificationRepository notificationRepo;

    public StudioBookingController(StudioBookingRepository bookingRepo,
            StudentRepository studentRepo,
            com.dance.studio.repository.NotificationRepository notificationRepo) {
        this.bookingRepo = bookingRepo;
        this.studentRepo = studentRepo;
        this.notificationRepo = notificationRepo;
    }

    // --- STUDENT ENDPOINTS ---

    @PostMapping("/book")
    public ResponseEntity<?> createBooking(@RequestBody Map<String, Object> payload) {
        try {
            Long studentId = Long.parseLong(payload.get("studentId").toString());
            Student student = studentRepo.findById(studentId)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            StudioBooking booking = new StudioBooking();
            booking.setStudent(student);
            booking.setFullName((String) payload.get("fullName"));
            booking.setMobile((String) payload.get("mobile"));
            booking.setPurpose((String) payload.get("purpose"));
            booking.setMessage((String) payload.get("message"));
            booking.setBookingDate(LocalDate.parse((String) payload.get("bookingDate")));
            booking.setTimeSlot((String) payload.get("timeSlot"));

            bookingRepo.save(booking);
            return ResponseEntity.ok(Map.of("success", true, "message", "Booking Request Sent!"));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/my-bookings/{studentId}")
    public List<StudioBooking> getMyBookings(@PathVariable Long studentId) {
        return bookingRepo.findByStudentIdOrderByCreatedAtDesc(studentId);
    }

    @PostMapping("/{id}/upload-payment")
    public ResponseEntity<?> uploadPayment(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        try {
            StudioBooking booking = bookingRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            String uploadDir = System.getProperty("user.dir") + "/uploads/studio/payments/";
            File dir = new File(uploadDir);
            if (!dir.exists())
                dir.mkdirs();

            String fileName = "studio_" + id + "_" + System.currentTimeMillis() + ".jpg";
            file.transferTo(new File(dir, fileName));

            booking.setPaymentScreenshot(fileName);
            // If admin already accepted, move to waiting verification
            if ("ACCEPTED".equals(booking.getStatus())) {
                booking.setStatus("PAYMENT_PENDING_VERIFICATION");
            }
            bookingRepo.save(booking);

            return ResponseEntity.ok("Payment proof uploaded successfully");
        } catch (IOException e) {
            return ResponseEntity.internalServerError().body("Upload failed");
        }
    }

    // --- ADMIN ENDPOINTS ---

    @GetMapping("/all")
    public List<StudioBooking> getAllBookings() {
        return bookingRepo.findAllByOrderByCreatedAtDesc();
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        StudioBooking booking = bookingRepo.findById(id).orElseThrow(() -> new RuntimeException("Booking not found"));
        String status = payload.get("status");

        // Conflict Check
        if ("CONFIRMED".equals(status)) {
            boolean conflict = bookingRepo.existsByBookingDateAndTimeSlotAndStatus(
                    booking.getBookingDate(),
                    booking.getTimeSlot(),
                    "CONFIRMED");
            if (conflict) {
                return ResponseEntity.badRequest().body(Map.of("success", false, "message",
                        "This slot is already CONFIRMED for another booking. Please choose another time."));
            }
        }

        booking.setStatus(status);
        if (payload.containsKey("remarks")) {
            booking.setAdminRemarks(payload.get("remarks"));
        }
        bookingRepo.save(booking);

        // 🔔 NOTIFICATION LOGIC
        if ("ACCEPTED".equals(status) && booking.getStudent() != null) {
            try {
                com.dance.studio.model.Notification notif = new com.dance.studio.model.Notification();
                notif.setType("BOOKING_UPDATE");
                notif.setStudent(booking.getStudent());
                notif.setTimestamp(java.time.LocalDateTime.now());

                String amountMsg = booking.getAmount() != null ? " Amount: ₹" + booking.getAmount() : "";
                notif.setMessage("Your studio booking for " + booking.getBookingDate() + " is APPROVED." + amountMsg
                        + " Please upload payment proof to confirm.");

                notificationRepo.save(notif);
            } catch (Exception e) {
                System.err.println("Failed to send notification: " + e.getMessage());
            }
        }

        return ResponseEntity.ok(booking);
    }

    // ✅ ADMIN: CREATE BOOKING MANUALLY
    @PostMapping("/admin/book")
    public ResponseEntity<?> adminCreateBooking(@RequestBody Map<String, Object> payload) {
        try {
            StudioBooking booking = new StudioBooking();

            // Optional Student Link
            if (payload.get("studentId") != null) {
                Long studentId = Long.parseLong(payload.get("studentId").toString());
                studentRepo.findById(studentId).ifPresent(booking::setStudent);
            }

            booking.setFullName((String) payload.get("fullName"));
            booking.setMobile((String) payload.get("mobile"));
            booking.setPurpose((String) payload.get("purpose"));
            booking.setMessage((String) payload.get("message"));
            booking.setBookingDate(LocalDate.parse((String) payload.get("bookingDate")));
            booking.setTimeSlot((String) payload.get("timeSlot"));

            // Admin bookings are approved by default unless specified
            String status = (String) payload.getOrDefault("status", "ACCEPTED");

            // Conflict Check
            if ("CONFIRMED".equals(status)) {
                boolean conflict = bookingRepo.existsByBookingDateAndTimeSlotAndStatus(
                        booking.getBookingDate(),
                        booking.getTimeSlot(),
                        "CONFIRMED");
                if (conflict) {
                    return ResponseEntity.badRequest().body(Map.of("success", false, "message",
                            "Slot already booked! Please select a different time."));
                }
            }

            booking.setStatus(status);

            bookingRepo.save(booking);
            return ResponseEntity.ok(Map.of("success", true, "message", "Booking created successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ✅ ADMIN: UPDATE BOOKING
    @PutMapping("/admin/{id}")
    public ResponseEntity<?> adminUpdateBooking(@PathVariable Long id, @RequestBody Map<String, Object> payload) {
        try {
            StudioBooking booking = bookingRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Booking not found"));

            booking.setFullName((String) payload.get("fullName"));
            booking.setMobile((String) payload.get("mobile"));
            booking.setPurpose((String) payload.get("purpose"));
            booking.setMessage((String) payload.get("message"));

            if (payload.get("bookingDate") != null)
                booking.setBookingDate(LocalDate.parse((String) payload.get("bookingDate")));

            if (payload.get("timeSlot") != null)
                booking.setTimeSlot((String) payload.get("timeSlot"));

            if (payload.get("status") != null)
                booking.setStatus((String) payload.get("status"));

            bookingRepo.save(booking);
            return ResponseEntity.ok(Map.of("success", true, "message", "Booking updated successfully!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    // ✅ ADMIN: DELETE BOOKING
    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deleteBooking(@PathVariable Long id) {
        bookingRepo.deleteById(id);
        return ResponseEntity.ok(Map.of("success", true, "message", "Booking deleted"));
    }
}
