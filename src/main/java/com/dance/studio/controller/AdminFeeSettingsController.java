package com.dance.studio.controller;

import com.dance.studio.model.FeeSettings;
import com.dance.studio.repository.FeeSettingsRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/fee-settings")
@CrossOrigin
public class AdminFeeSettingsController {

    private final FeeSettingsRepository settingsRepo;

    public AdminFeeSettingsController(FeeSettingsRepository settingsRepo) {
        this.settingsRepo = settingsRepo;
    }

    @GetMapping
    public FeeSettings getSettings() {
        return settingsRepo.findAll().stream().findFirst().orElseGet(() -> {
            FeeSettings defaultSettings = new FeeSettings();
            return settingsRepo.save(defaultSettings);
        });
    }

    @PutMapping
    public FeeSettings updateSettings(@RequestBody FeeSettings updated) {
        FeeSettings existing = settingsRepo.findAll().stream().findFirst().orElseGet(FeeSettings::new);

        existing.setAdmissionFee(updated.getAdmissionFee());
        existing.setMonthlyFee(updated.getMonthlyFee());
        existing.setQuarterlyFee(updated.getQuarterlyFee());
        existing.setHalfYearlyFee(updated.getHalfYearlyFee());
        existing.setYearlyFee(updated.getYearlyFee());
        existing.setPrivateClassFee(updated.getPrivateClassFee());
        existing.setDiscountPercent(updated.getDiscountPercent());
        existing.setFeeNotes(updated.getFeeNotes());

        return settingsRepo.save(existing);
    }
}
