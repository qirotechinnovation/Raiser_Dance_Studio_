package com.dance.studio.controller;

import com.dance.studio.model.Fee;
import com.dance.studio.model.FeeTransaction;
import com.dance.studio.model.Student;
import com.dance.studio.model.Notification;
import com.dance.studio.repository.FeeRepository;
import com.dance.studio.repository.FeeTransactionRepository;
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
    private final FeeTransactionRepository feeTransactionRepo;
    private final StudentRepository studentRepo;
    private final NotificationRepository notificationRepo;

    public AdminFeeController(FeeRepository feeRepo, FeeTransactionRepository feeTransactionRepo, StudentRepository studentRepo,
            NotificationRepository notificationRepo) {
        this.feeRepo = feeRepo;
        this.feeTransactionRepo = feeTransactionRepo;
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

    // ✅ GET FEES OF STUDENT (With Auto-Generation if missing)
    @GetMapping("/student/{studentId}")
    public List<Fee> getStudentFees(@PathVariable Long studentId) {
        List<Fee> list = feeRepo.findByStudentId(studentId);
        if (list.isEmpty()) {
            Student student = studentRepo.findById(studentId).orElse(null);
            if (student != null) {
                double amount = student.getAdmissionFee() > 0 ? student.getAdmissionFee() : 1600.0;
                String plan = student.getFeePlan() != null ? student.getFeePlan() : "MONTHLY";
                String currentMonth = LocalDate.now().getMonth().name();
                currentMonth = currentMonth.substring(0, 1).toUpperCase() + currentMonth.substring(1).toLowerCase() + " " + LocalDate.now().getYear();

                boolean hasPaidAlready = (student.getTotalOutstanding() != null && student.getTotalOutstanding() == 0.0) || 
                    ("PAID".equalsIgnoreCase(student.getRegistrationFeeStatus()));

                Fee autoFee = new Fee();
                autoFee.setStudent(student);
                autoFee.setAmount(amount);
                autoFee.setPlan(plan);
                autoFee.setFeeType("ADMISSION");
                autoFee.setStatus(hasPaidAlready ? "PAID" : "UNPAID");
                if (hasPaidAlready) {
                    autoFee.setPaidAmount(amount);
                    autoFee.setPaidDate(student.getJoiningDate() != null ? student.getJoiningDate() : LocalDate.now());
                    autoFee.setPaymentMode("ONLINE");
                    autoFee.setReceiptNo("RDS-" + (1000 + student.getId()));
                }
                autoFee.setFeeMonth(currentMonth);
                autoFee.setDueDate(student.getJoiningDate() != null ? student.getJoiningDate().plusMonths(1) : LocalDate.now());
                if (student.getBatch() != null) {
                    autoFee.setBatchName(student.getBatch().getName());
                }

                Fee saved = feeRepo.save(autoFee);
                return List.of(saved);
            }
        }
        return list;
    }

    // ✅ GET ALL FEES (With Auto-Generation & Auto-Heal for Paid Students)
    @GetMapping
    public List<Fee> getAllFees() {
        try {
            List<Student> allStudents = studentRepo.findAll();
            for (Student s : allStudents) {
                if (s != null && s.getId() != null) {
                    List<Fee> existing = feeRepo.findByStudentId(s.getId());
                    boolean hasPaidAlready = (s.getTotalOutstanding() != null && s.getTotalOutstanding() == 0.0) || 
                        ("PAID".equalsIgnoreCase(s.getRegistrationFeeStatus())) ||
                        s.isActive();

                    if (hasPaidAlready) {
                        s.setRegistrationFeeStatus("PAID");
                        s.setTotalOutstanding(0.0);
                        studentRepo.save(s);
                    }

                    if (existing.isEmpty()) {
                        double amount = s.getAdmissionFee() > 0 ? s.getAdmissionFee() : 200.0;
                        String plan = s.getFeePlan() != null ? s.getFeePlan() : "Monthly";
                        String month = LocalDate.now().getMonth().name();
                        month = month.substring(0, 1).toUpperCase() + month.substring(1).toLowerCase() + " " + LocalDate.now().getYear();

                        Fee autoFee = new Fee();
                        autoFee.setStudent(s);
                        autoFee.setAmount(amount);
                        autoFee.setPlan(plan);
                        autoFee.setFeeType("ADMISSION");
                        autoFee.setStatus(hasPaidAlready ? "PAID" : "UNPAID");
                        if (hasPaidAlready) {
                            autoFee.setPaidAmount(amount);
                            autoFee.setPaidDate(s.getJoiningDate() != null ? s.getJoiningDate() : LocalDate.now());
                            autoFee.setPaymentMode("ONLINE");
                            autoFee.setReceiptNo("RDS-" + (1000 + s.getId()));
                        }
                        autoFee.setFeeMonth(month);
                        autoFee.setDueDate(s.getJoiningDate() != null ? s.getJoiningDate().plusMonths(1) : LocalDate.now());
                        if (s.getBatch() != null) {
                            autoFee.setBatchName(s.getBatch().getName());
                        }
                        feeRepo.save(autoFee);
                    } else {
                        for (Fee f : existing) {
                            if (hasPaidAlready && ("ADMISSION".equalsIgnoreCase(f.getFeeType()) || f.getAmount() <= 200.0) && "UNPAID".equalsIgnoreCase(f.getStatus())) {
                                f.setStatus("PAID");
                                f.setPaidAmount(f.getAmount() > 0 ? f.getAmount() : 200.0);
                                f.setPaidDate(s.getJoiningDate() != null ? s.getJoiningDate() : LocalDate.now());
                                f.setPaymentMode("ONLINE");
                                if (f.getReceiptNo() == null) {
                                    f.setReceiptNo("RDS-" + (1000 + s.getId()));
                                }
                                feeRepo.save(f);
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("Error auto-generating missing fees: " + e.getMessage());
        }
        return feeRepo.findAll();
    }

    // ✅ MARK ADMISSION FEE AS PAID FOR A STUDENT
    @PutMapping("/student/{studentId}/pay-admission")
    public Student markAdmissionFeePaid(@PathVariable Long studentId) {
        Student student = studentRepo.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        student.setRegistrationFeeStatus("PAID");
        student.setTotalOutstanding(0.0);
        Student savedStudent = studentRepo.save(student);

        List<Fee> fees = feeRepo.findByStudentId(studentId);
        for (Fee f : fees) {
            if ("ADMISSION".equalsIgnoreCase(f.getFeeType()) || f.getAmount() <= 200.0) {
                f.setStatus("PAID");
                f.setPaidAmount(f.getAmount() > 0 ? f.getAmount() : 200.0);
                f.setPaidDate(LocalDate.now());
                f.setPaymentMode("CASH");
                if (f.getReceiptNo() == null) {
                    f.setReceiptNo("RDS-" + (1000 + studentId));
                }
                feeRepo.save(f);
            }
        }
        return savedStudent;
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
        if (feeDetails.getPaidAmount() != null) {
            fee.setPaidAmount(feeDetails.getPaidAmount());
        }
        fee.setAutoRenewNextCycle(feeDetails.isAutoRenewNextCycle());

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
    @org.springframework.transaction.annotation.Transactional
    public org.springframework.http.ResponseEntity<?> deleteFee(@PathVariable Long id) {
        Fee fee = feeRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee record not found"));

        Student student = fee.getStudent();
        if (student != null) {
            double remainingUnpaid = Math.max(0, fee.getAmount() - (fee.getPaidAmount() != null ? fee.getPaidAmount() : 0));
            if (remainingUnpaid > 0) {
                student.setTotalOutstanding(Math.max(0, student.getTotalOutstanding() - remainingUnpaid));
                studentRepo.save(student);
            }
        }

        // Clean up linked transactions first to prevent foreign key constraint issues
        List<FeeTransaction> txns = feeTransactionRepo.findByFeeId(id);
        if (txns != null && !txns.isEmpty()) {
            feeTransactionRepo.deleteAll(txns);
        }

        feeRepo.delete(fee);
        return org.springframework.http.ResponseEntity.ok(java.util.Collections.singletonMap("message", "Fee record deleted successfully"));
    }

    // ✅ MARK FEE AS PAID with DETAILS
    @PutMapping("/{feeId}/pay")
    public Fee markPaid(
            @PathVariable Long feeId,
            @RequestParam(required = false) String paymentMode,
            @RequestParam(required = false) String transactionId,
            @RequestParam(required = false) String remarks,
            @RequestParam(required = false) Double amountPaid) {
        Fee fee = feeRepo.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if ("PAID".equalsIgnoreCase(fee.getStatus())) {
            return fee; // Already paid
        }

        double paymentVal = amountPaid != null ? amountPaid : fee.getAmount();
        double currentPaidAmount = fee.getPaidAmount() != null ? fee.getPaidAmount() : 0.0;
        double newPaidAmount = currentPaidAmount + paymentVal;
        
        // ✅ Automatic Receipt Number Generation for this transaction
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
        
        fee.setPaidAmount(newPaidAmount);
        fee.setPaymentMode(paymentMode != null ? paymentMode : "CASH");
        fee.setTransactionId(transactionId);
        fee.setRemarks(remarks);
        fee.setReceiptNo(nextReceiptNo); // keep last receipt on fee for ref

        if (newPaidAmount >= fee.getAmount()) {
            fee.setStatus("PAID");
            fee.setPaidDate(LocalDate.now());
        } else if (newPaidAmount > 0) {
            fee.setStatus("PARTIAL");
        }

        Fee saved = feeRepo.save(fee);

        // Save Fee Transaction
        FeeTransaction transaction = new FeeTransaction(saved, paymentVal, LocalDate.now(), 
            paymentMode != null ? paymentMode : "CASH", transactionId, nextReceiptNo);
        feeTransactionRepo.save(transaction);

        // Update Student's total outstanding balance
        if (fee.getStudent() != null) {
            Student student = fee.getStudent();
            double currentOutstanding = student.getTotalOutstanding();

            // Deduct the partial or full amount from balance
            student.setTotalOutstanding(Math.max(0, currentOutstanding - paymentVal));
            studentRepo.save(student);

            if ("PAID".equalsIgnoreCase(saved.getStatus()) && saved.isAutoRenewNextCycle()) {
                LocalDate nextDueDate = calculateNextDueDate(fee.getDueDate(), fee.getPlan());
                String nextMonthName = fee.getFeeMonth();
                if (nextDueDate != null) {
                    String m = nextDueDate.getMonth().name();
                    nextMonthName = m.substring(0, 1).toUpperCase() + m.substring(1).toLowerCase() + " " + nextDueDate.getYear();
                }

                double nextAmount = (fee.getAmount() > 200.0) ? fee.getAmount() : 1600.0;
                String nextFeeType = "Monthly Fee";
                if (fee.getPlan() != null && fee.getPlan().equalsIgnoreCase("Quarterly")) {
                    nextFeeType = "Quarterly Fee";
                    if (nextAmount <= 200.0) nextAmount = 3500.0;
                }

                // Auto-generate next fee record as UNPAID for student who is continuing
                Fee nextFee = new Fee(null, nextAmount, fee.getDiscountPercent(),
                        fee.getPlan(), "UNPAID", nextFeeType, nextMonthName, nextDueDate,
                        null, student, null, null, null, null, null);
                nextFee.setBatchName(fee.getBatchName());
                nextFee.setAutoRenewNextCycle(true);
                feeRepo.save(nextFee);

                // Mark old Fee Reminders as read
                notificationRepo.findByStudentId(student.getId()).stream()
                        .filter(n -> "FEE_REMINDER".equals(n.getType()) && !n.isRead())
                        .forEach(n -> {
                            n.setRead(true);
                            notificationRepo.save(n);
                        });
            }
        }

        return saved;
    }

    // ✅ GET ALL INDIVIDUAL TRANSACTIONS
    @GetMapping("/transactions/all")
    public List<FeeTransaction> getAllTransactions() {
        return feeTransactionRepo.findAll();
    }

    // ✅ GET TRANSACTIONS FOR A FEE
    @GetMapping("/{feeId}/transactions")
    public List<FeeTransaction> getTransactionsByFee(@PathVariable Long feeId) {
        return feeTransactionRepo.findByFeeId(feeId);
    }

    // ✅ GET TRANSACTIONS FOR A STUDENT
    @GetMapping("/student/{studentId}/transactions")
    public List<FeeTransaction> getTransactionsByStudent(@PathVariable Long studentId) {
        return feeTransactionRepo.findByFeeStudentId(studentId);
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
        return feeRepo.findAllPendingOrPartialFees();
    }

    // ✅ SEND REMINDER
    @PostMapping("/{feeId}/remind")
    public String sendReminder(@PathVariable Long feeId) {
        Fee fee = feeRepo.findById(feeId)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if ("PAID".equalsIgnoreCase(fee.getStatus())) {
            throw new RuntimeException("Fee is already fully paid");
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
        List<Fee> pending = feeRepo.findPendingOrPartialFeesDueOnOrBefore(LocalDate.now());
        return pending.stream()
                .map(f -> f.getStudent().getName() + ": " + f.getAmount() + " (Due: " + f.getDueDate() + ")")
                .collect(Collectors.toList());
    }
}
