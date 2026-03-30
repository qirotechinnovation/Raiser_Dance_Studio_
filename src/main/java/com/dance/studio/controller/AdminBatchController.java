package com.dance.studio.controller;

import com.dance.studio.model.Batch;
import com.dance.studio.model.DanceType;
import com.dance.studio.repository.BatchRepository;
import com.dance.studio.repository.DanceTypeRepository;
import com.dance.studio.repository.ClassScheduleRepository;
import com.dance.studio.model.ClassSchedule;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/admin/batches")
@CrossOrigin
@SuppressWarnings("null")
public class AdminBatchController {

    private final BatchRepository batchRepo;
    private final DanceTypeRepository danceTypeRepo;
    private final ClassScheduleRepository scheduleRepo;

    // ✅ CREATE
    @PostMapping
    public Batch create(@RequestBody Batch batch) {
        if (batch.getDanceType() != null && batch.getDanceType().getId() != null) {
            DanceType dt = danceTypeRepo.findById(batch.getDanceType().getId())
                    .orElseThrow(() -> new RuntimeException("DanceType not found"));
            batch.setDanceType(dt);
            batch.setDanceType(dt);
        }
        Batch savedBatch = batchRepo.save(batch);
        generateSchedules(savedBatch);
        return savedBatch;
    }

    @GetMapping
    public List<Batch> all() {
        return batchRepo.findAll();
    }

    @GetMapping("/status/{status}")
    public List<Batch> getByStatus(@PathVariable String status) {
        boolean active = "ACTIVE".equalsIgnoreCase(status);
        return batchRepo.findByActive(active);
    }

    @PutMapping("/{id}")
    public Batch update(@PathVariable Long id, @RequestBody Batch updated) {
        Batch batch = batchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        batch.setName(updated.getName());
        batch.setTiming(updated.getTiming());
        batch.setDays(updated.getDays());
        batch.setActive(updated.isActive());
        batch.setInstructor(updated.getInstructor());
        batch.setLevel(updated.getLevel());
        batch.setStartTime(updated.getStartTime());
        batch.setEndTime(updated.getEndTime());
        batch.setMaxCapacity(updated.getMaxCapacity());
        batch.setCurrentStudents(updated.getCurrentStudents());
        batch.setRoomNumber(updated.getRoomNumber());
        batch.setStartDate(updated.getStartDate());
        batch.setEndDate(updated.getEndDate());

        if (updated.getDanceType() != null && updated.getDanceType().getId() != null) {
            DanceType dt = danceTypeRepo.findById(updated.getDanceType().getId())
                    .orElseThrow(() -> new RuntimeException("DanceType not found"));
            batch.setDanceType(dt);
        }

        Batch savedBatch = batchRepo.save(batch);
        generateSchedules(savedBatch);
        return savedBatch;
    }

    @PutMapping("/{id}/deactivate")
    public Batch deactivate(@PathVariable Long id) {
        Batch batch = batchRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found"));
        batch.setActive(false);
        return batchRepo.save(batch);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        batchRepo.deleteById(id);
    }

    @PostMapping("/sync-all-schedules")
    public Map<String, Object> syncAll() {
        List<Batch> all = batchRepo.findAll();
        for (Batch b : all) {
            generateSchedules(b);
        }
        Map<String, Object> res = new HashMap<>();
        res.put("success", true);
        res.put("count", all.size());
        return res;
    }

    // ✅ BATCH ENROLLMENT INQUIRIES
    private final com.dance.studio.repository.BatchEnrollmentRepository enrollmentRepo;
    private final com.dance.studio.repository.StudentRepository studentRepo;
    private final com.dance.studio.repository.NotificationRepository notificationRepo;

    public AdminBatchController(BatchRepository batchRepo,
            DanceTypeRepository danceTypeRepo,
            ClassScheduleRepository scheduleRepo,
            com.dance.studio.repository.BatchEnrollmentRepository enrollmentRepo,
            com.dance.studio.repository.StudentRepository studentRepo,
            com.dance.studio.repository.NotificationRepository notificationRepo) {
        this.batchRepo = batchRepo;
        this.danceTypeRepo = danceTypeRepo;
        this.scheduleRepo = scheduleRepo;
        this.enrollmentRepo = enrollmentRepo;
        this.studentRepo = studentRepo;
        this.notificationRepo = notificationRepo;
    }

    @GetMapping("/inquiries")
    public List<com.dance.studio.model.BatchEnrollmentInquiry> getAllInquiries() {
        return enrollmentRepo.findByStatusOrderByTimestampDesc("PENDING");
    }

    @PostMapping("/inquiry/{id}/approve")
    public Map<String, Object> approveInquiry(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            com.dance.studio.model.BatchEnrollmentInquiry inquiry = enrollmentRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Inquiry not found"));

            // Assign student to batch
            com.dance.studio.model.Student student = inquiry.getStudent();
            student.setBatch(inquiry.getBatch());
            studentRepo.save(student);

            // Update inquiry status
            inquiry.setStatus("APPROVED");
            enrollmentRepo.save(inquiry);

            // Create notification for student
            com.dance.studio.model.Notification notification = new com.dance.studio.model.Notification();
            notification.setType("BATCH_ENROLLMENT");
            notification
                    .setMessage("Your enrollment request for " + inquiry.getBatch().getName() + " has been approved!");
            notification.setStudent(student);
            notification.setTimestamp(java.time.LocalDateTime.now());
            notification.setRead(false);
            notificationRepo.save(notification);

            response.put("success", true);
            response.put("message", "Enrollment approved");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    @PostMapping("/inquiry/{id}/reject")
    public Map<String, Object> rejectInquiry(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            com.dance.studio.model.BatchEnrollmentInquiry inquiry = enrollmentRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Inquiry not found"));

            inquiry.setStatus("REJECTED");
            enrollmentRepo.save(inquiry);

            // Create notification for student
            com.dance.studio.model.Notification notification = new com.dance.studio.model.Notification();
            notification.setType("BATCH_ENROLLMENT");
            notification.setMessage(
                    "Your enrollment request for " + inquiry.getBatch().getName() + " was not approved at this time.");
            notification.setStudent(inquiry.getStudent());
            notification.setTimestamp(java.time.LocalDateTime.now());
            notification.setRead(false);
            notificationRepo.save(notification);

            response.put("success", true);
            response.put("message", "Enrollment rejected");
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Error: " + e.getMessage());
        }
        return response;
    }

    private void generateSchedules(Batch batch) {
        if (batch.getId() == null)
            return;
        List<ClassSchedule> existing = scheduleRepo.findByBatchId(batch.getId());
        scheduleRepo.deleteAll(existing);

        if (batch.getDays() != null && !batch.getDays().isEmpty()) {
            String[] days = batch.getDays().split(",");
            for (String day : days) {
                if (day.trim().isEmpty())
                    continue;
                ClassSchedule schedule = new ClassSchedule();
                schedule.setBatch(batch);
                schedule.setDayOfWeek(day.trim());
                schedule.setStartTime(batch.getStartTime());
                schedule.setEndTime(batch.getEndTime());
                schedule.setActivity(batch.getName());
                scheduleRepo.save(schedule);
            }
        }
    }
}
