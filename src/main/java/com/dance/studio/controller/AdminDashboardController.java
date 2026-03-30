package com.dance.studio.controller;

import com.dance.studio.model.Fee;
import com.dance.studio.repository.*;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/dashboard")
@CrossOrigin
public class AdminDashboardController {

    private final StudentRepository studentRepo;
    private final BatchRepository batchRepo;
    private final FeeRepository feeRepo;
    private final EventRepository eventRepo;
    private final EventInquiryRepository eventInquiryRepo;
    private final SangeetInquiryRepository sangeetInquiryRepo;
    private final BatchEnrollmentRepository batchEnrollmentRepo;
    private final HolidayRepository holidayRepo;

    public AdminDashboardController(
            StudentRepository studentRepo,
            BatchRepository batchRepo,
            FeeRepository feeRepo,
            EventRepository eventRepo,
            SangeetInquiryRepository sangeetInquiryRepo,
            EventInquiryRepository eventInquiryRepo,
            BatchEnrollmentRepository batchEnrollmentRepo,
            HolidayRepository holidayRepo) {
        this.studentRepo = studentRepo;
        this.batchRepo = batchRepo;
        this.feeRepo = feeRepo;
        this.eventRepo = eventRepo;
        this.sangeetInquiryRepo = sangeetInquiryRepo;
        this.eventInquiryRepo = eventInquiryRepo;
        this.batchEnrollmentRepo = batchEnrollmentRepo;
        this.holidayRepo = holidayRepo;
    }

    @GetMapping
    public Map<String, Object> dashboard(@RequestParam(required = false) Long adminId) {

        Map<String, Object> data = new LinkedHashMap<>();

        // Admin Info (if ID provided)
        if (adminId != null) {
            data.put("adminName", "Super Admin"); // For now super admin or fetch from repo
        }

        data.put("activeStudents", studentRepo.countByActiveTrue());
        data.put("inactiveStudents", studentRepo.countByActiveFalse());
        data.put("newRegistrationsCount", studentRepo.findByBatchIsNull().size());
        data.put("activeBatches", batchRepo.countByActiveTrue());

        // Fees collected this month with null safety
        Double feesCollected = feeRepo.sumPaidFeesForMonth(LocalDate.now().getMonthValue(),
                LocalDate.now().getYear());
        data.put("feesCollectedThisMonth", feesCollected != null ? feesCollected : 0.0);

        // Total fees collected (All-time)
        Double totalCollected = feeRepo.sumAllPaidFees();
        data.put("totalFeesCollected", totalCollected != null ? totalCollected : 0.0);

        System.out.println("📊 Dashboard Stats - Month: " + feesCollected + ", Total: " + totalCollected);

        LocalDate today = LocalDate.now();
        List<Fee> pendingFeesList = feeRepo.findByStatusAndDueDateLessThanEqual("UNPAID", today);

        data.put("pendingFees", (long) pendingFeesList.size());

        // Calculate total pending fees amount safely (only count fees due today or in
        // the past)
        Double pendingAmount = pendingFeesList.stream()
                .mapToDouble(Fee::getAmount)
                .sum();
        data.put("pendingFeesAmount", pendingAmount);

        data.put("upcomingEvents", eventRepo.countByDateAfter(LocalDate.now()));

        List<com.dance.studio.model.Holiday> todaysHolidays = holidayRepo.findAll().stream()
                .filter(h -> h.getDate().equals(today))
                .collect(Collectors.toList());

        boolean isGlobalHoliday = todaysHolidays.stream().anyMatch(h -> h.getBatch() == null);
        Set<Long> holidayBatchIds = todaysHolidays.stream()
                .filter(h -> h.getBatch() != null)
                .map(h -> h.getBatch().getId())
                .collect(Collectors.toSet());

        if (isGlobalHoliday) {
            data.put("todaysClasses", 0);
            data.put("todayList", new ArrayList<>());
        } else {
            List<com.dance.studio.model.Batch> activeToday = batchRepo.findAll().stream()
                    .filter(b -> b.isActive())
                    .filter(b -> b.isScheduledForDay(today.getDayOfWeek()))
                    .filter(b -> !holidayBatchIds.contains(b.getId()))
                    .filter(b -> b.getStartDate() == null || !today.isBefore(b.getStartDate()))
                    .filter(b -> b.getEndDate() == null || !today.isAfter(b.getEndDate()))
                    .collect(Collectors.toList());

            data.put("todaysClasses", activeToday.size());
            data.put("todayList", activeToday);
        }

        // Separate inquiry counts for each type
        long pendingEventInquiries = eventInquiryRepo.countByStatus("PENDING");
        long pendingSangeetInquiries = sangeetInquiryRepo.countByStatus("PENDING");
        long pendingBatchEnrollments = batchEnrollmentRepo.countByStatus("PENDING");

        data.put("pendingEventInquiries", pendingEventInquiries);
        data.put("pendingSangeetInquiries", pendingSangeetInquiries);
        data.put("pendingBatchEnrollments", pendingBatchEnrollments);
        data.put("pendingInquiries", pendingEventInquiries + pendingSangeetInquiries + pendingBatchEnrollments); // Total
                                                                                                                 // for
                                                                                                                 // backward
                                                                                                                 // compatibility
                                                                                                                 // //
                                                                                                                 // for
                                                                                                                 // backward
                                                                                                                 // compatibility

        data.put("eventList", eventRepo.findByDateAfterOrderByDateAsc(LocalDate.now()));
        data.put("holidayList", holidayRepo.findByDateAfterOrderByDateAsc(LocalDate.now().minusDays(1)));

        // Recent Activity (Merge Students & Fees)
        List<Map<String, Object>> activities = new ArrayList<>();

        studentRepo.findTop5ByOrderByJoiningDateDesc().forEach(s -> {
            Map<String, Object> act = new HashMap<>();
            act.put("id", "S" + s.getId());
            act.put("title", "New Enrollment");
            act.put("sub", s.getName() + " joined");
            act.put("time", "Recent");
            act.put("icon", "account-plus-outline");
            act.put("color", "#F0FDF4");
            act.put("iconColor", "#22C55E");
            activities.add(act);
        });

        feeRepo.findTop5ByStatusOrderByPaidDateDesc("PAID").forEach(f -> {
            Map<String, Object> act = new java.util.HashMap<>();
            act.put("id", "F" + f.getId());
            act.put("title", "Payment Received");
            act.put("sub", "Fee paid by " + (f.getStudent() != null ? f.getStudent().getName() : "Student"));
            act.put("time", "Recent");
            act.put("icon", "credit-card-outline");
            act.put("color", "#FFF1F2");
            act.put("iconColor", "#E11D48");
            activities.add(act);
        });

        data.put("recentActivity", activities);

        return data;
    }
}
