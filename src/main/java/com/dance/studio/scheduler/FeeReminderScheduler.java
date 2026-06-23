package com.dance.studio.scheduler;

import com.dance.studio.model.Fee;
import com.dance.studio.repository.FeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
public class FeeReminderScheduler {

    @Autowired
    private FeeRepository feeRepo;

    @Autowired
    private com.dance.studio.repository.NotificationRepository notificationRepo;

    @Scheduled(cron = "0 0 9 * * ?") // Daily at 9 AM
    public void sendFeeReminders() {
        LocalDate reminderDate = LocalDate.now().plusDays(3);
        List<Fee> upcomingFees = feeRepo.findByStatusAndDueDate("UNPAID", reminderDate);

        for (Fee fee : upcomingFees) {
            String message = "Reminder: Your fee of ₹" + fee.getAmount() + " for " + 
                             (fee.getFeeMonth() != null ? fee.getFeeMonth() : fee.getPlan()) + 
                             " is due in 3 days (" + fee.getDueDate() + "). Download our app to pay online: https://raisers.dance/app";
            
            // 1. Notify Student
            com.dance.studio.model.Notification studentNotif = new com.dance.studio.model.Notification();
            studentNotif.setType("FEE_REMINDER");
            studentNotif.setMessage(message);
            studentNotif.setTimestamp(java.time.LocalDateTime.now());
            studentNotif.setStudent(fee.getStudent());
            notificationRepo.save(studentNotif);

            // 2. Notify Admin
            com.dance.studio.model.Notification adminNotif = new com.dance.studio.model.Notification();
            adminNotif.setType("FEE_REMINDER_ADMIN");
            adminNotif.setMessage("Upcoming Fee: " + fee.getStudent().getName() + " has a payment of ₹" + 
                                 fee.getAmount() + " due on " + fee.getDueDate());
            adminNotif.setTimestamp(java.time.LocalDateTime.now());
            adminNotif.setStudent(null); // Null student means it's for admin
            notificationRepo.save(adminNotif);

            System.out.println("🔔 Sent 3-day Fee Reminder for: " + fee.getStudent().getName());
        }
    }
}
