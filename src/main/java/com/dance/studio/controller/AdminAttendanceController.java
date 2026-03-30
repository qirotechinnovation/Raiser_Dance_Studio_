package com.dance.studio.controller;

import com.dance.studio.model.Attendance;
import com.dance.studio.repository.AttendanceRepository;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

@RestController
@RequestMapping("/admin/attendance")
@CrossOrigin
public class AdminAttendanceController {

    private final AttendanceRepository repo;

    public AdminAttendanceController(AttendanceRepository repo) {
        this.repo = repo;
    }

    @PostMapping("/bulk")
    public java.util.List<Attendance> saveBulk(@RequestBody java.util.List<Attendance> records) {
        if (records == null || records.isEmpty())
            return java.util.Collections.emptyList();

        java.util.List<Attendance> savedRecords = new java.util.ArrayList<>();
        for (Attendance record : records) {
            if (record.getStudent() == null || record.getDate() == null)
                continue;

            java.util.List<Attendance> existing = repo.findByStudentIdAndDate(record.getStudent().getId(),
                    record.getDate());
            if (!existing.isEmpty()) {
                Attendance a = existing.get(0);
                a.setPresent(record.isPresent());
                savedRecords.add(repo.save(a));
            } else {
                savedRecords.add(repo.save(record));
            }
        }
        return savedRecords;
    }

    @GetMapping("/batch/{batchId}")
    public List<Attendance> getByBatch(@PathVariable Long batchId) {
        return repo.findByStudentBatchId(batchId);
    }

    @GetMapping("/batch/{batchId}/date/{date}")
    public List<Attendance> getByBatchAndDate(@PathVariable Long batchId, @PathVariable String date) {
        LocalDate localDate = LocalDate.parse(date);
        return repo.findByStudentBatchIdAndDate(batchId, localDate);
    }

    @GetMapping("/batch/{batchId}/month/{year}/{month}")
    public List<Attendance> getByBatchAndMonth(@PathVariable Long batchId, @PathVariable int year,
            @PathVariable int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.with(TemporalAdjusters.lastDayOfMonth());
        return repo.findByStudentBatchIdAndDateBetween(batchId, start, end);
    }

    @PutMapping("/{id}")
    public Attendance update(@PathVariable long id, @RequestBody Attendance details) {
        Attendance a = repo.findById(id).orElseThrow(() -> new RuntimeException("Attendance record not found"));
        a.setPresent(details.isPresent());
        a.setDate(details.getDate());
        return repo.save(a);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable long id) {
        repo.deleteById(id);
        return "Attendance record deleted";
    }
}
