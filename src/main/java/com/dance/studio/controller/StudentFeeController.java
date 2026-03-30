package com.dance.studio.controller;

import org.springframework.web.bind.annotation.*;
import com.dance.studio.model.Fee;
import java.util.*;
import java.time.LocalDate;

import com.dance.studio.repository.FeeRepository;

@RestController
@RequestMapping("/student")
@CrossOrigin
public class StudentFeeController {

    private final FeeRepository feeRepo;
    private final com.dance.studio.repository.AttendanceRepository attendanceRepo;

    public StudentFeeController(FeeRepository feeRepo,
            com.dance.studio.repository.AttendanceRepository attendanceRepo) {
        this.feeRepo = feeRepo;
        this.attendanceRepo = attendanceRepo;
    }

    @GetMapping("/{id}/fees")
    public Map<String, Object> fees(@PathVariable Long id) {
        List<Fee> feeList = feeRepo.findByStudentId(id);

        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> history = new ArrayList<>();

        double pendingAmount = 0;
        LocalDate nextDueDate = null;
        String currentPlan = "N/A";

        for (Fee f : feeList) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", f.getId());
            item.put("plan", f.getPlan());
            item.put("amount", f.getAmount());
            item.put("status", f.getStatus());
            item.put("date", f.getPaidDate() != null ? f.getPaidDate().toString() : f.getDueDate().toString());
            item.put("method", f.getPaymentMode() != null ? f.getPaymentMode() : "N/A");
            history.add(item);

            if ("UNPAID".equalsIgnoreCase(f.getStatus())) {
                pendingAmount += f.getAmount();
                if (nextDueDate == null || f.getDueDate().isBefore(nextDueDate)) {
                    nextDueDate = f.getDueDate();
                }
            }
            if (f.getPlan() != null) {
                currentPlan = f.getPlan();
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("plan", currentPlan);
        summary.put("pending", String.format("%.2f", pendingAmount));
        summary.put("nextDue", nextDueDate != null ? nextDueDate.toString() : "No Dues");

        // Attendance for current month
        LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
        long attCount = attendanceRepo.countByStudentIdAndDateAfter(id, firstOfMonth.minusDays(1));
        summary.put("attendanceCount", attCount);

        response.put("history", history);
        response.put("summary", summary);

        return response;
    }
}
