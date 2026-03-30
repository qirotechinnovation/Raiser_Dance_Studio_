package com.dance.studio.controller;

import com.dance.studio.model.FeeSettings;
import com.dance.studio.repository.FeeSettingsRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public/fee-settings")
@CrossOrigin
public class PublicFeeSettingsController {

    private final FeeSettingsRepository settingsRepo;

    public PublicFeeSettingsController(FeeSettingsRepository settingsRepo) {
        this.settingsRepo = settingsRepo;
    }

    @GetMapping
    public FeeSettings getSettings() {
        return settingsRepo.findAll().stream().findFirst().orElseGet(() -> {
            FeeSettings defaultSettings = new FeeSettings();
            // Default initialization if needed
            defaultSettings.setAdmissionFee(200.0);
            return defaultSettings;
        });
    }
}
