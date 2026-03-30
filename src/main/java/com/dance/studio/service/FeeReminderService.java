package com.dance.studio.service;

import com.dance.studio.model.Fee;
import com.dance.studio.repository.FeeRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@SuppressWarnings("null")
public class FeeReminderService {

    private final FeeRepository feeRepo;
    private final NotificationService notificationService;

    public FeeReminderService(FeeRepository feeRepo, NotificationService notificationService) {
        this.feeRepo = feeRepo;
        this.notificationService = notificationService;
    }

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * ?")
    public void sendAutomatedReminders() {
        System.out.println("--- Starting Automated Fee Reminders ---");

        List<Fee> overdueFees = feeRepo.findByStatusAndDueDateLessThanEqual("UNPAID", LocalDate.now());

        for (Fee fee : overdueFees) {
            // String studentName = fee.getStudent() != null ? fee.getStudent().getName() :
            // "Student"; // Unused
            String studentEmail = fee.getStudent() != null ? fee.getStudent().getEmail() : null;
            String parentMobile = fee.getStudent() != null ? fee.getStudent().getParentMobile() : "N/A";

            String message = String.format(
                    "Your Monthly Dance Fee of ₹%.2f is due. Please complete payment to continue classes.",
                    fee.getAmount());

            // 1. Send Push to Student
            if (studentEmail != null) {
                notificationService.sendPush(studentEmail, "Fee Due Reminder", message);
            }

            // 2. Send SMS to Parent
            if (!"N/A".equals(parentMobile)) {
                notificationService.sendSMS(parentMobile, message);
            }
        }

        // 3. DAILY PENDING LIST FOR ADMIN
        if (!overdueFees.isEmpty()) {
            StringBuilder adminSummary = new StringBuilder("Daily Pending Fee List:\n");
            for (Fee f : overdueFees) {
                adminSummary.append("- ").append(f.getStudent().getName()).append(": ₹").append(f.getAmount())
                        .append("\n");
            }
            notificationService.sendEmail("admin@studio.com", "Daily Pending Fees Report", adminSummary.toString());
        }

        System.out.println("--- Finished Automated Fee Reminders (" + overdueFees.size() + " processed) ---");
    }
}
