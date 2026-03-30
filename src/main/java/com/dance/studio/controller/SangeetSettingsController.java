package com.dance.studio.controller;

import com.dance.studio.model.SangeetSettings;
import com.dance.studio.service.SangeetSettingsService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin/sangeet/settings")
@CrossOrigin
public class SangeetSettingsController {
    private final SangeetSettingsService service;

    public SangeetSettingsController(SangeetSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public SangeetSettings getSettings() {
        return service.getSettings();
    }

    @PutMapping
    public SangeetSettings updateSettings(@RequestBody SangeetSettings settings) {
        return service.updateSettings(settings);
    }
}
