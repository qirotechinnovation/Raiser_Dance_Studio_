package com.dance.studio.controller;

import com.dance.studio.model.Fee;
import com.dance.studio.model.Student;
import com.dance.studio.model.Notification;
import com.dance.studio.repository.FeeRepository;
import com.dance.studio.repository.StudentRepository;
import com.dance.studio.repository.NotificationRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/fees")
@CrossOrigin
@SuppressWarnings("null")
public class AdminFeeController {

    private final FeeRepository feeRepo;
    private final StudentRepository studentRepo;
    private final NotificationRepository notificationRepo;

    public AdminFeeController(FeeRepository feeRepo, StudentRepository studentRepo,
            NotificationRepository notificationRepo) {
        this.feeRepo = feeRepo;
        this.studentRepo = studentRepo;
        this.notificationRepo = notificationRepo;
    }

    // ✅ ADD FEE (Admin manual entry)
    @PostMapping("/student/{studentId}")
    public Fee addFee(
            @PathVariable Long studentId,
            @RequestBody Fee fee) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        fee.setStudent(student);
        if (fee.getBatchName() == null && student.getBatch() != null) {
            fee.setBatchName(student.getBatch().getName());
        }
        if (fee.getStatus() == null)
            fee.setStatus("UNPAID");

        Fee saved = feeRepo.save(fee);

        // Update Student's total outstanding balance if fee is unpaid
        if ("UNPAID".equalsIgnoreCase(saved.getStatus())) {
            student.setTotalOutstanding(student.getTotalOutstanding() + saved.getAmount());
            studentRepo.save(student);
        }

        return saved;
    }

    // ✅ GET FEES OF STUDENT
    @GetMapping("/student/{studentId}")
    public List<Fee> getStudentFees(@PathVariable Long studentId) {
        return feeRepo.findByStudentId(studentId);
    }

    // ✅ GET ALL FEES
    @GetMapping
    public List<Fee> getAllFees() {
        return feeRepo.findAll();
    }

    // ✅ GET FEE BY ID
    @GetMapping("/{id}")
    public Fee getFeeById(@PathVariable Long id) {
        return feeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));
    }

    // ✅ UPDATE FEE (ADMIN CORRECTION)
    @PutMapping("/{id}")
    public Fee updateFee(@PathVariable Long id, @RequestBody Fee feeDetails) {
        Fee fee = feeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));

        Student student = fee.getStudent();
        double oldAmount = fee.getAmount();
        String oldStatus = fee.getStatus();

        fee.setAmount(feeDetails.getAmount());
        fee.setPlan(feeDetails.getPlan());
        fee.setDueDate(feeDetails.getDueDate());
        fee.setDiscountPercent(feeDetails.getDiscountPercent());
        fee.setStatus(feeDetails.getStatus());
        fee.setRemarks(feeDetails.getRemarks());
        fee.setFeeType(feeDetails.getFeeType());
        fee.setFeeMonth(feeDetails.getFeeMonth());
        fee.setBatchName(feeDetails.getBatchName());

        Fee saved = feeRepo.save(fee);

        // Update Student's total outstanding balance based on changes
        if (student != null) {
            double currentBalance = student.getTotalOutstanding();

            // Revert old fee influence
            if ("UNPAID".equalsIgnoreCase(oldStatus)) {
                currentBalance -= oldAmount;
            }

            // Apply new fee influence
            if ("UNPAID".equalsIgnoreCase(saved.getStatus())) {
                currentBalance += saved.getAmount();
            }

            student.setTotalOutstanding(Math.max(0, currentBalance));
            studentRepo.save(student);
        }

        return saved;
    }

    // ✅ DELETE FEE
    @DeleteMapping("/{id}")
    public String deleteFee(@PathVariable Long id) {
        Fee fee = feeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));

        Student student = fee.getStudent();
        if (student != null && "UNPAID".equalsIgnoreCase(fee.getStatus())) {
            student.setTotalOutstanding(Math.max(0, student.getTotalOutstanding() - fee.getAmount()));
            studentRepo.save(student);
        }

        feeRepo.deleteById(id);
        return "Fee record deleted successfully";
    }

    // ✅ MARK FEE AS PAID with DETAILS
    @PutMapping("/{feeId}/pay")
    public Fee markPaid(
            @PathVariable Long feeId,
            @RequestParam(required = false) String paymentMode,
            @RequestParam(required = false) String transactionId,
            @RequestParam(required = false) String remarks) {
        Fee fee = feeRepo.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if ("PAID".equalsIgnoreCase(fee.getStatus())) {
            return fee; // Already paid
        }

        fee.setStatus("PAID");
        fee.setPaidDate(LocalDate.now());
        fee.setPaymentMode(paymentMode != null ? paymentMode : "CASH");
        fee.setTransactionId(transactionId);
        fee.setRemarks(remarks);

        // ✅ Automatic Receipt Number Generation
        String nextReceiptNo = "RDS-1001";
        Fee lastFee = feeRepo.findTopByReceiptNoIsNotNullOrderByReceiptNoDesc();
        if (lastFee != null && lastFee.getReceiptNo() != null) {
            try {
                String lastNo = lastFee.getReceiptNo();
                if (lastNo.contains("-")) {
                    int lastVal = Integer.parseInt(lastNo.split("-")[1]);
                    nextReceiptNo = "RDS-" + (lastVal + 1);
                }
            } catch (Exception e) {
                nextReceiptNo = "RDS-" + System.currentTimeMillis() / 10000;
            }
        }
        fee.setReceiptNo(nextReceiptNo);

        Fee saved = feeRepo.save(fee);

        // Update Student's total outstanding balance
        if (fee.getStudent() != null) {
            Student student = fee.getStudent();
            double currentOutstanding = student.getTotalOutstanding();

            // Deduct the amount from balance
            student.setTotalOutstanding(Math.max(0, currentOutstanding - fee.getAmount()));
            studentRepo.save(student);

            // Auto-generate next fee record as UNPAID
            Fee nextFee = new Fee(null, fee.getAmount(), fee.getDiscountPercent(),
                    fee.getPlan(), "UNPAID", fee.getFeeType(), fee.getFeeMonth(), calculateNextDueDate(fee.getDueDate(), fee.getPlan()),
                    null, student, null, null, null, null, null);
            nextFee.setBatchName(fee.getBatchName());
            feeRepo.save(nextFee);

            // Mark old Fee Reminders as read
            notificationRepo.findByStudentId(student.getId()).stream()
                    .filter(n -> "FEE_REMINDER".equals(n.getType()) && !n.isRead())
                    .forEach(n -> {
                        n.setRead(true);
                        notificationRepo.save(n);
                    });
        }

        return saved;
    }

    private LocalDate calculateNextDueDate(LocalDate current, String plan) {
        if (current == null)
            current = LocalDate.now();
        if (plan == null)
            return current.plusMonths(1);

        switch (plan.toUpperCase()) {
            case "QUARTERLY":
                return current.plusMonths(3);
            case "YEARLY":
                return current.plusYears(1);
            case "HALFYEARLY":
                return current.plusMonths(6);
            default:
                return current.plusMonths(1);
        }
    }

    // ✅ PENDING FEES (ADMIN DASH)
    @GetMapping("/pending")
    public List<Fee> pendingFees() {
        return feeRepo.findByStatusAndDueDateLessThanEqual("UNPAID", LocalDate.now());
    }

    // ✅ SEND REMINDER
    @PostMapping("/{feeId}/remind")
    public String sendReminder(@PathVariable Long feeId) {
        Fee fee = feeRepo.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if (!"UNPAID".equals(fee.getStatus())) {
            throw new RuntimeException("Fee is already paid");
        }

        fee.setLastReminderSent(LocalDate.now());
        feeRepo.save(fee);

        // Create notification for student
        Student student = fee.getStudent();
        String studentName = student.getName();
        String mobile = student.getParentMobile();

        String message = String.format(
                "Fee Reminder for %s (ID: %d) | Pending Amount: ₹%.2f. Due Date: %s. Please clear your dues. Download app: https://raisers.dance/app",
                studentName, student.getId(), fee.getAmount(), fee.getDueDate());

        // Save notification to database
        Notification notification = new Notification();
        notification.setType("FEE_REMINDER");
        notification.setMessage(message);
        notification.setStudent(student);
        notification.setTimestamp(LocalDateTime.now());
        notification.setRead(false);
        notificationRepo.save(notification);

        System.out.println("SENDING SMS to " + mobile + ": " + message);

        return "Reminder sent to " + studentName;
    }

    // ✅ DAILY PENDING LIST FOR ADMIN
    @GetMapping("/daily-summary")
    public List<String> getDailySummary() {
        List<Fee> pending = feeRepo.findByStatusAndDueDateLessThanEqual("UNPAID", LocalDate.now());
        return pending.stream()
                .map(f -> f.getStudent().getName() + ": " + f.getAmount() + " (Due: " + f.getDueDate() + ")")
                .collect(Collectors.toList());
    }
}
