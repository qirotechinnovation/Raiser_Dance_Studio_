package com.dance.studio.service;

import com.dance.studio.model.SangeetSettings;
import com.dance.studio.repository.SangeetSettingsRepository;
import org.springframework.stereotype.Service;

@Service
@SuppressWarnings("null")
public class SangeetSettingsService {
    private final SangeetSettingsRepository repository;

    public SangeetSettingsService(SangeetSettingsRepository repository) {
        this.repository = repository;
    }

    public SangeetSettings getSettings() {
        return repository.findAll().stream().findFirst().orElse(new SangeetSettings());
    }

    public SangeetSettings updateSettings(SangeetSettings settings) {
        SangeetSettings existing = getSettings();
        if (existing.getId() != null) {
            settings.setId(existing.getId());
        }
        return repository.save(settings);
    }
}
