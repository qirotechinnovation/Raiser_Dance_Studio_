package com.dance.studio.service;

import com.dance.studio.model.Fee;
import com.dance.studio.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@SuppressWarnings("null")
public class AdminDashboardService {

    private final StudentRepository studentRepo;
    private final BatchRepository batchRepo;
    private final FeeRepository feeRepo;
    private final EventRepository eventRepo;
    private final EventInquiryRepository eventInquiryRepo;
    private final SangeetInquiryRepository sangeetInquiryRepo;

    public AdminDashboardService(
            StudentRepository studentRepo,
            BatchRepository batchRepo,
            FeeRepository feeRepo,
            EventRepository eventRepo,
            EventInquiryRepository eventInquiryRepo,
            SangeetInquiryRepository sangeetInquiryRepo) {
        this.studentRepo = studentRepo;
        this.batchRepo = batchRepo;
        this.feeRepo = feeRepo;
        this.eventRepo = eventRepo;
        this.eventInquiryRepo = eventInquiryRepo;
        this.sangeetInquiryRepo = sangeetInquiryRepo;
    }

    public Map<String, Object> getDashboardData(Long adminId) {
        Map<String, Object> data = new LinkedHashMap<>();

        // Admin Info
        if (adminId != null) {
            data.put("adminName", "Super Admin"); // Replace with actual admin fetch if needed
        }

        // Statistics
        data.put("activeStudents", studentRepo.countByActiveTrue());
        data.put("inactiveStudents", studentRepo.countByActiveFalse());
        data.put("newRegistrationsCount", studentRepo.findByBatchIsNull().size());
        data.put("activeBatches", batchRepo.countByActiveTrue());

        // Fee Stats
        Double collectedThisMonth = feeRepo.sumPaidFeesForMonth(LocalDate.now().getMonthValue(),
                LocalDate.now().getYear());
        data.put("feesCollectedThisMonth", collectedThisMonth != null ? collectedThisMonth : 0.0);

        long pendingFeesCount = feeRepo.countByStatus("UNPAID");
        data.put("pendingFees", pendingFeesCount);

        double pendingAmount = feeRepo.findByStatus("UNPAID").stream()
                .mapToDouble(Fee::getAmount)
                .sum();
        data.put("pendingFeesAmount", pendingAmount);

        // Events & Classes
        data.put("upcomingEvents", eventRepo.countByDateAfter(LocalDate.now()));
        data.put("todaysClasses", batchRepo.countByDaysContaining(LocalDate.now().getDayOfWeek().name()));

        // Inquiries
        long pendingEventInquiries = eventInquiryRepo.countByStatus("PENDING");
        long pendingSangeetInquiries = sangeetInquiryRepo.count();
        data.put("pendingInquiries", pendingEventInquiries + pendingSangeetInquiries);

        // Lists
        data.put("eventList", eventRepo.findByDateAfterOrderByDateAsc(LocalDate.now()));
        data.put("todayList", batchRepo.findByDaysContaining(LocalDate.now().getDayOfWeek().name()));

        // Recent Activity
        data.put("recentActivity", getRecentActivities());

        return data;
    }

    private List<Map<String, Object>> getRecentActivities() {
        List<Map<String, Object>> activities = new ArrayList<>();

        // New Enrollments
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

        // Recent Payments
        feeRepo.findTop5ByStatusOrderByPaidDateDesc("PAID").forEach(f -> {
            Map<String, Object> act = new HashMap<>();
            act.put("id", "F" + f.getId());
            act.put("title", "Payment Received");
            act.put("sub", "Fee paid by " + (f.getStudent() != null ? f.getStudent().getName() : "Student"));
            act.put("time", "Recent");
            act.put("icon", "credit-card-outline");
            act.put("color", "#FFF1F2");
            act.put("iconColor", "#E11D48");
            activities.add(act);
        });

        return activities;
    }
}
