package com.dance.studio.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.dance.studio.model.Fee;
import com.dance.studio.repository.FeeRepository;

@RestController
@RequestMapping("/admin/reminders")
@CrossOrigin
public class FeeReminderController {

    private final FeeRepository feeRepo;

    public FeeReminderController(FeeRepository feeRepo) {
        this.feeRepo = feeRepo;
    }

    // ✅ FEES DUE BEFORE TODAY
    @GetMapping("/fees")
    public List<Fee> dueFees() {
        return feeRepo.findByStatusAndDueDateBefore(
                "UNPAID",
                LocalDate.now()
        );
    }
}
