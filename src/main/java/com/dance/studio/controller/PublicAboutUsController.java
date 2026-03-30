package com.dance.studio.controller;

import com.dance.studio.model.AboutUsSettings;
import com.dance.studio.repository.AboutUsSettingsRepository;
import com.dance.studio.repository.CoreValueRepository;
import com.dance.studio.repository.EventGalleryRepository;
import com.dance.studio.repository.AboutUsCardRepository;
import com.dance.studio.model.AboutUsCard;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/public/about-us")
@CrossOrigin(origins = "*")
public class PublicAboutUsController {

    @Autowired
    private AboutUsSettingsRepository aboutUsRepo;

    @Autowired
    private CoreValueRepository coreValueRepo;

    @Autowired
    private EventGalleryRepository eventGalleryRepo;

    @Autowired
    private AboutUsCardRepository aboutUsCardRepo;

    @GetMapping
    public ResponseEntity<?> getAboutUsData() {
        Map<String, Object> response = new HashMap<>();

        // Get settings
        List<AboutUsSettings> settings = aboutUsRepo.findAll();
        AboutUsSettings aboutUsSettings = settings.isEmpty() ? new AboutUsSettings() : settings.get(0);

        // Get active about us cards
        List<AboutUsCard> cards = aboutUsCardRepo.findByActiveTrueOrderByDisplayOrderAsc();

        response.put("settings", aboutUsSettings);
        response.put("cards", cards);
        response.put("coreValues", coreValueRepo.findAll());
        response.put("gallery", eventGalleryRepo.findAll());

        return ResponseEntity.ok(response);
    }
}
