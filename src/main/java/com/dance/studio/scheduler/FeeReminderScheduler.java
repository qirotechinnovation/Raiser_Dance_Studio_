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

    private final FeeRepository feeRepo;

    @Autowired  
    public FeeReminderScheduler(FeeRepository feeRepo) {
        this.feeRepo = feeRepo;
    }

    @Scheduled(cron = "0 0 9 * * ?")
    public void sendFeeReminders() {

        LocalDate today = LocalDate.now();

        List<Fee> dueFees =
                feeRepo.findByStatusAndDueDateLessThanEqual("UNPAID", today);

        for (Fee fee : dueFees) {
            System.out.println(
                "🔔 Fee Reminder | Student: " +
                fee.getStudent().getName() +
                " | Amount ₹" + fee.getAmount() +
                " | Due: " + fee.getDueDate()
            );
        }
    }
}
