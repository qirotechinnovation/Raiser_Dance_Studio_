package com.dance.studio.controller;

import com.dance.studio.model.Holiday;
import com.dance.studio.model.Notification;
import com.dance.studio.model.Student;
import com.dance.studio.repository.HolidayRepository;
import com.dance.studio.repository.NotificationRepository;
import com.dance.studio.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/holidays")
@CrossOrigin
@SuppressWarnings("null")
public class HolidayController {

    private final HolidayRepository holidayRepo;
    private final StudentRepository studentRepo;
    private final NotificationRepository notificationRepo;

    public HolidayController(HolidayRepository holidayRepo, StudentRepository studentRepo,
            NotificationRepository notificationRepo) {
        this.holidayRepo = holidayRepo;
        this.studentRepo = studentRepo;
        this.notificationRepo = notificationRepo;
    }

    // ✅ ADD HOLIDAY & NOTIFY
    @PostMapping
    public Holiday addHoliday(@RequestBody Holiday holiday) {
        Holiday saved = holidayRepo.save(holiday);

        // Notify students
        List<Student> students;
        String prefix = "Holiday Alert: ";

        if (saved.getBatch() != null) {
            // Batch specific
            students = studentRepo.findByBatchId(saved.getBatch().getId());
            prefix = "[" + saved.getBatch().getName() + "] Batch Holiday: ";
        } else {
            // General studio holiday
            students = studentRepo.findAll();
        }

        String msg = prefix + saved.getName() + " on " + saved.getDate() + ". "
                + (saved.getDescription() != null ? saved.getDescription() : "");

        for (Student s : students) {
            if (!s.isActive())
                continue; // Skip inactive
            Notification n = new Notification();
            n.setStudent(s);
            n.setType("HOLIDAY");
            n.setMessage(msg);
            n.setTimestamp(LocalDateTime.now());
            n.setRead(false);
            notificationRepo.save(n);
        }

        return saved;
    }

    // ✅ GET UPCOMING HOLIDAYS
    @GetMapping("/upcoming")
    public List<Holiday> getUpcoming() {
        return holidayRepo.findByDateAfterOrderByDateAsc(LocalDate.now().minusDays(1));
    }

    @GetMapping("/upcoming/batch/{batchId}")
    public List<Holiday> getUpcoming(@PathVariable Long batchId) {
        return holidayRepo.findByBatchIdOrBatchIsNullAndDateAfterOrderByDateAsc(batchId, LocalDate.now().minusDays(1));
    }

    // ✅ DELETE HOLIDAY
    @DeleteMapping("/{id}")
    public void deleteHoliday(@PathVariable Long id) {
        holidayRepo.deleteById(id);
    }

    // ✅ UPDATE HOLIDAY
    @PutMapping("/{id}")
    public Holiday updateHoliday(@PathVariable Long id, @RequestBody Holiday updated) {
        Holiday holiday = holidayRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Holiday not found"));

        holiday.setName(updated.getName());
        holiday.setDate(updated.getDate());
        holiday.setDescription(updated.getDescription());
        holiday.setBatch(updated.getBatch());

        return holidayRepo.save(holiday);
    }
}
