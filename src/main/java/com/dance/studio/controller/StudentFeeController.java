package com.dance.studio.controller;

import org.springframework.web.bind.annotation.*;
import com.dance.studio.model.Fee;
import java.util.*;
import java.time.LocalDate;

import com.dance.studio.repository.FeeRepository;
import com.dance.studio.repository.FeeTransactionRepository;
import com.dance.studio.model.FeeTransaction;

@RestController
@RequestMapping("/student")
@CrossOrigin
public class StudentFeeController {

    private final FeeRepository feeRepo;
    private final FeeTransactionRepository feeTransactionRepo;
    private final com.dance.studio.repository.AttendanceRepository attendanceRepo;

    public StudentFeeController(FeeRepository feeRepo, FeeTransactionRepository feeTransactionRepo,
            com.dance.studio.repository.AttendanceRepository attendanceRepo) {
        this.feeRepo = feeRepo;
        this.feeTransactionRepo = feeTransactionRepo;
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
            item.put("plan", f.getPlan() != null ? f.getPlan() : "N/A");
            item.put("amount", f.getAmount());
            item.put("status", f.getStatus() != null ? f.getStatus() : "UNPAID");
            item.put("dueDate", f.getDueDate() != null ? f.getDueDate().toString() : "N/A");
            item.put("paidDate", f.getPaidDate() != null ? f.getPaidDate().toString() : null);
            item.put("date", f.getPaidDate() != null ? f.getPaidDate().toString() : (f.getDueDate() != null ? f.getDueDate().toString() : "N/A"));
            item.put("method", f.getPaymentMode() != null ? f.getPaymentMode() : "N/A");
            item.put("feeType", f.getFeeType() != null ? f.getFeeType() : "MONTHLY");
            item.put("feeMonth", f.getFeeMonth() != null ? f.getFeeMonth() : "N/A");
            item.put("batchName", f.getBatchName() != null ? f.getBatchName() : "N/A");
            item.put("paidAmount", f.getPaidAmount() != null ? f.getPaidAmount() : 0.0);
            item.put("receiptNo", f.getReceiptNo() != null ? f.getReceiptNo() : "N/A");
            item.put("transactionId", f.getTransactionId() != null ? f.getTransactionId() : "N/A");
            
            // Attach individual transactions
            List<FeeTransaction> txns = feeTransactionRepo.findByFeeId(f.getId());
            item.put("transactions", txns != null ? txns : new ArrayList<>());
            
            history.add(item);

            if (!"PAID".equalsIgnoreCase(f.getStatus())) {
                double currentPaid = f.getPaidAmount() != null ? f.getPaidAmount() : 0.0;
                pendingAmount += Math.max(0, f.getAmount() - currentPaid);
                
                if (f.getDueDate() != null && (nextDueDate == null || f.getDueDate().isBefore(nextDueDate))) {
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
