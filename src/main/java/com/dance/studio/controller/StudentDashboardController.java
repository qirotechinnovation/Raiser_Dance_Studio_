package com.dance.studio.controller;

import com.dance.studio.model.Attendance;
import com.dance.studio.model.Batch;
import com.dance.studio.model.Event;
import com.dance.studio.model.Student;
import com.dance.studio.repository.AttendanceRepository;
import com.dance.studio.repository.EventRepository;
import com.dance.studio.repository.FeeRepository;
import com.dance.studio.repository.StudentRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/student")
@CrossOrigin
public class StudentDashboardController {

    private final StudentRepository studentRepo;
    private final FeeRepository feeRepo;
    private final EventRepository eventRepo;
    private final AttendanceRepository attendanceRepo;
    private final com.dance.studio.repository.HolidayRepository holidayRepo;
    private final com.dance.studio.repository.ClassScheduleRepository scheduleRepo;
    private final com.dance.studio.repository.SangeetInquiryRepository sangeetRepo;

    public StudentDashboardController(
            StudentRepository studentRepo,
            FeeRepository feeRepo,
            EventRepository eventRepo,
            AttendanceRepository attendanceRepo,
            com.dance.studio.repository.HolidayRepository holidayRepo,
            com.dance.studio.repository.ClassScheduleRepository scheduleRepo,
            com.dance.studio.repository.SangeetInquiryRepository sangeetRepo) {
        this.studentRepo = studentRepo;
        this.feeRepo = feeRepo;
        this.eventRepo = eventRepo;
        this.attendanceRepo = attendanceRepo;
        this.holidayRepo = holidayRepo;
        this.scheduleRepo = scheduleRepo;
        this.sangeetRepo = sangeetRepo;
    }

    @PostMapping("/{id}/check-in")
    public Map<String, Object> checkIn(@PathVariable long id) {
        Map<String, Object> res = new HashMap<>();
        try {
            Student student = studentRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            LocalDate today = LocalDate.now();
            boolean isHoliday = holidayRepo.findAll().stream()
                    .anyMatch(h -> h.getDate().equals(today) && (h.getBatch() == null || h.getBatch().getId()
                            .equals(student.getBatch() != null ? student.getBatch().getId() : -1L)));

            if (isHoliday) {
                res.put("success", false);
                res.put("message", "Today is a Holiday for your batch. Check-in is disabled.");
                return res;
            }

            java.util.List<Attendance> existingList = attendanceRepo.findByStudentIdAndDate(id, today);

            if (!existingList.isEmpty()) {
                Attendance existing = existingList.get(0);
                if (existing.isPresent()) {
                    res.put("success", false);
                    res.put("message", "You are already marked as Present today!");
                } else {
                    existing.setPresent(true);
                    attendanceRepo.save(existing);
                    res.put("success", true);
                    res.put("message", "Your attendance has been updated to Present!");
                }
            } else {
                Attendance attendance = new Attendance();
                attendance.setStudent(student);
                attendance.setDate(today);
                attendance.setPresent(true);
                attendanceRepo.save(attendance);
                res.put("success", true);
                res.put("message", "Checked in successfully!");
            }
        } catch (Exception e) {
            e.printStackTrace();
            res.put("success", false);
            res.put("message", "Internal Error: " + e.getMessage());
        }
        return res;
    }

    @GetMapping("/{id}/dashboard")
    public Map<String, Object> dashboard(@PathVariable long id) {
        try {
            Student student = studentRepo.findById(id)
                    .orElseThrow(() -> new RuntimeException("Student not found"));

            Batch batch = student.getBatch();

            // Safe Event Fetching
            Event nextEvent = null;
            try {
                java.util.List<Event> upcomingEvents = eventRepo
                        .findByDateGreaterThanEqualOrderByDateAsc(LocalDate.now());
                if (upcomingEvents != null && !upcomingEvents.isEmpty()) {
                    nextEvent = upcomingEvents.get(0);
                }
            } catch (Exception e) {
                System.out.println("Error fetching events: " + e.getMessage());
            }

            Map<String, Object> res = new HashMap<>();
            res.put("welcomeName", student.getName());
            res.put("batchId", batch != null ? batch.getId() : null);
            res.put("batchName", batch != null ? batch.getName() : "General Batch");
            String currentDay = LocalDate.now().getDayOfWeek().name();
            boolean isHoliday = holidayRepo.findAll().stream()
                    .anyMatch(h -> h.getDate().equals(LocalDate.now()) && (h.getBatch() == null
                            || h.getBatch().getId().equals(batch != null ? batch.getId() : -1L)));

            String batchTiming = "N/A";
            LocalDate today = LocalDate.now();
            if (isHoliday) {
                batchTiming = "BATCH/STUDIO HOLIDAY";
            } else if (batch != null && batch.getDays() != null) {
                boolean isBatchActive = true;
                if (batch.getStartDate() != null && today.isBefore(batch.getStartDate())) {
                    isBatchActive = false;
                    batchTiming = "Starts on " + batch.getStartDate();
                }
                if (batch.getEndDate() != null && today.isAfter(batch.getEndDate())) {
                    isBatchActive = false;
                    batchTiming = "Batch Ended";
                }

                if (isBatchActive) {
                    // Check for specific slots in ClassSchedule first
                    java.util.List<com.dance.studio.model.ClassSchedule> specificSlots = scheduleRepo
                            .findByBatchId(batch.getId());
                    Optional<com.dance.studio.model.ClassSchedule> todaySlot = specificSlots.stream()
                            .filter(s -> s.getDayOfWeek().equalsIgnoreCase(currentDay))
                            .findFirst();

                    if (todaySlot.isPresent()) {
                        batchTiming = todaySlot.get().getStartTime() + " - " + todaySlot.get().getEndTime();
                        if (todaySlot.get().getActivity() != null) {
                            res.put("todayActivity", todaySlot.get().getActivity());
                        }
                    } else if (batch.isScheduledForDay(today.getDayOfWeek())) {
                        batchTiming = batch.getTiming() != null ? batch.getTiming() : "N/A";
                    } else {
                        batchTiming = "No Class Today";
                    }
                }
            }

            res.put("todayBatchTiming", batchTiming);

            boolean isPending = false;
            Double pendingAmount = 0.0;
            try {
                java.util.List<com.dance.studio.model.Fee> unpaidFees = feeRepo.findByStudentId(id).stream()
                        .filter(f -> "UNPAID".equalsIgnoreCase(f.getStatus()))
                        .filter(f -> f.getDueDate() == null || !f.getDueDate().isAfter(LocalDate.now()))
                        .collect(java.util.stream.Collectors.toList());

                if (!unpaidFees.isEmpty()) {
                    isPending = true;
                    pendingAmount = unpaidFees.stream().mapToDouble(f -> f.getAmount()).sum();
                }
            } catch (Exception e) {
                System.out.println("Error checking fees: " + e.getMessage());
            }
            res.put("feeStatus", isPending ? "PENDING" : "PAID");
            res.put("pendingAmount", pendingAmount);

            // Add batch days
            res.put("batchDays", batch != null ? batch.getDays() : "Mon-Fri");

            // Attendance stats
            LocalDate firstOfMonth = LocalDate.now().withDayOfMonth(1);
            long attCount = 0;
            try {
                attCount = attendanceRepo.countByStudentIdAndDateAfter(id, firstOfMonth.minusDays(1));
            } catch (Exception e) {
                System.out.println("Error attendance count: " + e.getMessage());
            }
            res.put("attendanceCount", attCount);

            if (nextEvent != null) {
                Map<String, Object> evMap = new HashMap<>();
                evMap.put("title", nextEvent.getTitle() != null ? nextEvent.getTitle() : "Upcoming Event");
                evMap.put("date", nextEvent.getDate() != null ? nextEvent.getDate().toString() : "TBA");
                res.put("nextEvent", evMap);
            } else {
                res.put("nextEvent", null);
            }

            // Latest Updates
            java.util.List<Map<String, Object>> updates = new java.util.ArrayList<>();
            try {
                eventRepo.findAll().stream()
                        .filter(e -> e.getDate() != null && !e.getDate().isBefore(LocalDate.now()))
                        .sorted((e1, e2) -> e1.getDate().compareTo(e2.getDate()))
                        .limit(5)
                        .forEach(e -> {
                            Map<String, Object> up = new HashMap<>();
                            up.put("id", e.getId());
                            up.put("title", e.getTitle());
                            up.put("sub", "Scheduled for " + e.getDate());
                            up.put("type", e.getType() != null ? e.getType() : "Event");
                            updates.add(up);
                        });
            } catch (Exception e) {
                System.out.println("Error fetching updates: " + e.getMessage());
            }
            res.put("latestUpdates", updates);

            // 🎫 Confirmed Events for Student
            java.util.List<Map<String, Object>> confirmedEvents = new java.util.ArrayList<>();
            try {
                java.util.List<Event> bookedEvents = eventRepo.findByParticipantsId(id);
                for (Event evt : bookedEvents) {
                    if (evt.getDate() != null && !evt.getDate().isBefore(LocalDate.now())) {
                        Map<String, Object> evtMap = new HashMap<>();
                        evtMap.put("id", evt.getId());
                        evtMap.put("title", evt.getTitle());
                        evtMap.put("date", evt.getDate().toString());
                        evtMap.put("time", evt.getTime() != null ? evt.getTime() : "TBA");
                        evtMap.put("venue", evt.getVenue() != null ? evt.getVenue() : "Studio");
                        evtMap.put("type", evt.getType() != null ? evt.getType() : "Event");
                        confirmedEvents.add(evtMap);
                    }
                }
            } catch (Exception e) {
                System.out.println("Error fetching confirmed events: " + e.getMessage());
            }
            res.put("confirmedEvents", confirmedEvents);

            // Check if already checked in today
            boolean checkedInToday = false;
            String attendanceStatus = "NOT_MARKED";
            try {
                java.util.List<Attendance> todayAtt = attendanceRepo.findByStudentIdAndDate(id, LocalDate.now());
                if (!todayAtt.isEmpty()) {
                    Attendance att = todayAtt.get(0);
                    checkedInToday = att.isPresent();
                    attendanceStatus = att.isPresent() ? "PRESENT" : "ABSENT";
                }
            } catch (Exception e) {
                // Ignore
            }
            res.put("checkedInToday", checkedInToday);
            res.put("attendanceStatus", attendanceStatus);

            res.put("active", student.isActive());

            // --- MODERNIZATION DATA ---

            // 1. Attendance Rate (Simplified: Present days / 20 typical classes or tailored
            // to month so far)
            long presentDays = attCount;
            double rate = (presentDays / 20.0) * 100; // Assuming 20 classes/month avg
            res.put("attendanceRate", Math.min(100, (int) rate));

            // 2. Recent Payments
            java.util.List<com.dance.studio.model.Fee> recentPayments = feeRepo.findByStudentId(id).stream()
                    .filter(f -> "PAID".equalsIgnoreCase(f.getStatus()))
                    .sorted((f1, f2) -> {
                        if (f1.getPaidDate() == null)
                            return 1;
                        if (f2.getPaidDate() == null)
                            return -1;
                        return f2.getPaidDate().compareTo(f1.getPaidDate());
                    })
                    .limit(3)
                    .collect(java.util.stream.Collectors.toList());

            java.util.List<Map<String, Object>> paymentMaps = new java.util.ArrayList<>();
            for (com.dance.studio.model.Fee f : recentPayments) {
                Map<String, Object> pm = new HashMap<>();
                pm.put("id", f.getId());
                pm.put("amount", f.getAmount());
                pm.put("date", f.getPaidDate() != null ? f.getPaidDate().toString() : "N/A");
                pm.put("plan", f.getPlan());
                paymentMaps.add(pm);
            }
            res.put("recentPayments", paymentMaps);
            if (batch != null) {
                long mates = studentRepo.countByBatchId(batch.getId());
                res.put("batchMatesCount", mates);
            } else {
                res.put("batchMatesCount", 0);
            }

            // 4. Dance Type Info
            if (student.getDanceType() != null) {
                Map<String, Object> dtMap = new HashMap<>();
                dtMap.put("name", student.getDanceType().getName());
                dtMap.put("id", student.getDanceType().getId());
                res.put("danceTypeInfo", dtMap);
            }

            // 5. Wedding Choreography Bookings
            java.util.List<Map<String, Object>> sangeetBookings = new java.util.ArrayList<>();
            try {
                java.util.List<com.dance.studio.model.SangeetInquiry> inquiries = sangeetRepo.findByStudentId(id);
                for (com.dance.studio.model.SangeetInquiry inq : inquiries) {
                    Map<String, Object> inqMap = new HashMap<>();
                    inqMap.put("id", inq.getId());
                    inqMap.put("packageName", inq.getPackageOfInterest() != null ? inq.getPackageOfInterest().getName()
                            : "Custom Package");
                    inqMap.put("status", inq.getStatus());
                    inqMap.put("paymentStatus", inq.getPaymentStatus());
                    inqMap.put("eventDate", inq.getEventDate() != null ? inq.getEventDate().toString() : "TBA");
                    inqMap.put("feeAmount", inq.getFeeAmount());
                    sangeetBookings.add(inqMap);
                }
            } catch (Exception e) {
                System.out.println("Error fetching sangeet bookings: " + e.getMessage());
            }
            res.put("sangeetBookings", sangeetBookings);

            return res;

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> err = new HashMap<>();
            err.put("error", "Internal Server Error: " + e.getMessage());
            return err;
        }
    }
}
