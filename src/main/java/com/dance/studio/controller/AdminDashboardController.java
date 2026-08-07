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
        try {
            if (adminId != null) {
                data.put("adminName", "Super Admin");
            }

            try { data.put("activeStudents", studentRepo.countByActiveTrue()); } catch (Exception e) { data.put("activeStudents", 0L); }
            try { data.put("inactiveStudents", studentRepo.countByActiveFalse()); } catch (Exception e) { data.put("inactiveStudents", 0L); }
            
            try {
                data.put("newRegistrationsCount", studentRepo.findByBatchIsNull() != null ? studentRepo.findByBatchIsNull().size() : 0);
            } catch (Exception e) {
                data.put("newRegistrationsCount", 0);
            }
            
            try { data.put("activeBatches", batchRepo.countByActiveTrue()); } catch (Exception e) { data.put("activeBatches", 0L); }

            try {
                Double feesCollected = feeRepo.sumPaidFeesForMonth(LocalDate.now().getMonthValue(), LocalDate.now().getYear());
                data.put("feesCollectedThisMonth", feesCollected != null ? feesCollected : 0.0);
            } catch (Exception e) {
                data.put("feesCollectedThisMonth", 0.0);
            }

            try {
                Double totalCollected = feeRepo.sumAllPaidFees();
                data.put("totalFeesCollected", totalCollected != null ? totalCollected : 0.0);
            } catch (Exception e) {
                data.put("totalFeesCollected", 0.0);
            }

            LocalDate today = LocalDate.now();
            List<Fee> pendingFeesList = new ArrayList<>();
            try {
                pendingFeesList = feeRepo.findByStatus("UNPAID");
            } catch (Exception e) {
                // Ignore
            }

            data.put("pendingFees", (long) (pendingFeesList != null ? pendingFeesList.size() : 0));

            Double pendingAmount = 0.0;
            if (pendingFeesList != null) {
                pendingAmount = pendingFeesList.stream()
                        .filter(f -> f != null)
                        .mapToDouble(f -> Math.max(0, f.getAmount() - (f.getPaidAmount() != null ? f.getPaidAmount() : 0.0)))
                        .sum();
            }
            data.put("pendingFeesAmount", pendingAmount);

            try {
                data.put("upcomingEvents", eventRepo.countByDateAfter(LocalDate.now()));
            } catch (Exception e) {
                data.put("upcomingEvents", 0L);
            }

            List<com.dance.studio.model.Holiday> todaysHolidays = new ArrayList<>();
            try {
                todaysHolidays = holidayRepo.findAll().stream()
                        .filter(h -> h != null && h.getDate() != null && h.getDate().equals(today))
                        .collect(Collectors.toList());
            } catch (Exception e) {
                // Ignore
            }

            boolean isGlobalHoliday = todaysHolidays.stream().anyMatch(h -> h != null && h.getBatch() == null);
            Set<Long> holidayBatchIds = todaysHolidays.stream()
                    .filter(h -> h != null && h.getBatch() != null)
                    .map(h -> h.getBatch().getId())
                    .collect(Collectors.toSet());

            if (isGlobalHoliday) {
                data.put("todaysClasses", 0);
                data.put("todayList", new ArrayList<>());
            } else {
                List<com.dance.studio.model.Batch> activeToday = new ArrayList<>();
                try {
                    activeToday = batchRepo.findAll().stream()
                            .filter(b -> b != null && b.isActive())
                            .filter(b -> b.isScheduledForDay(today.getDayOfWeek()))
                            .filter(b -> !holidayBatchIds.contains(b.getId()))
                            .filter(b -> b.getStartDate() == null || !today.isBefore(b.getStartDate()))
                            .filter(b -> b.getEndDate() == null || !today.isAfter(b.getEndDate()))
                            .collect(Collectors.toList());
                } catch (Exception e) {
                    // Ignore
                }

                data.put("todaysClasses", activeToday.size());
                data.put("todayList", activeToday);
            }

            long pendingEventInquiries = 0;
            try { pendingEventInquiries = eventInquiryRepo.countByStatus("PENDING"); } catch(Exception e){}
            
            long pendingSangeetInquiries = 0;
            try { pendingSangeetInquiries = sangeetInquiryRepo.countByStatus("PENDING"); } catch(Exception e){}
            
            long pendingBatchEnrollments = 0;
            try { pendingBatchEnrollments = batchEnrollmentRepo.countByStatus("PENDING"); } catch(Exception e){}

            data.put("pendingEventInquiries", pendingEventInquiries);
            data.put("pendingSangeetInquiries", pendingSangeetInquiries);
            data.put("pendingBatchEnrollments", pendingBatchEnrollments);
            data.put("pendingInquiries", pendingEventInquiries + pendingSangeetInquiries + pendingBatchEnrollments);

            try {
                data.put("eventList", eventRepo.findByDateAfterOrderByDateAsc(LocalDate.now()));
            } catch (Exception e) {
                data.put("eventList", new ArrayList<>());
            }

            try {
                data.put("holidayList", holidayRepo.findByDateAfterOrderByDateAsc(LocalDate.now().minusDays(1)));
            } catch (Exception e) {
                data.put("holidayList", new ArrayList<>());
            }

            List<Map<String, Object>> activities = new ArrayList<>();
            try {
                studentRepo.findTop5ByOrderByJoiningDateDesc().forEach(s -> {
                    if (s != null) {
                        Map<String, Object> act = new HashMap<>();
                        act.put("id", "S" + s.getId());
                        act.put("title", "New Enrollment");
                        act.put("sub", (s.getName() != null ? s.getName() : "Student") + " joined");
                        act.put("time", "Recent");
                        act.put("icon", "account-plus-outline");
                        act.put("color", "#F0FDF4");
                        act.put("iconColor", "#22C55E");
                        activities.add(act);
                    }
                });
            } catch (Exception e) {}

            try {
                feeRepo.findTop5ByStatusOrderByPaidDateDesc("PAID").forEach(f -> {
                    if (f != null) {
                        Map<String, Object> act = new HashMap<>();
                        act.put("id", "F" + f.getId());
                        act.put("title", "Payment Received");
                        act.put("sub", "Fee paid by " + (f.getStudent() != null && f.getStudent().getName() != null ? f.getStudent().getName() : "Student"));
                        act.put("time", "Recent");
                        act.put("icon", "credit-card-outline");
                        act.put("color", "#FFF1F2");
                        act.put("iconColor", "#E11D48");
                        activities.add(act);
                    }
                });
            } catch (Exception e) {}

            data.put("recentActivity", activities);
        } catch (Exception e) {
            e.printStackTrace();
        }

        return data;
    }
}
