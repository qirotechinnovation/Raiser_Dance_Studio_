package com.dance.studio.controller;

import com.dance.studio.model.AboutUsSettings;
import com.dance.studio.model.CoreValue;
import com.dance.studio.model.EventGallery;
import com.dance.studio.model.AboutUsCard;
import com.dance.studio.repository.AboutUsSettingsRepository;
import com.dance.studio.repository.CoreValueRepository;
import com.dance.studio.repository.EventGalleryRepository;
import com.dance.studio.repository.AboutUsCardRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/admin/about-us")
@CrossOrigin(origins = "*")
public class AdminAboutUsController {

    @Autowired
    private AboutUsSettingsRepository aboutUsRepo;

    @Autowired
    private CoreValueRepository coreValueRepo;

    @Autowired
    private EventGalleryRepository eventGalleryRepo;

    @Autowired
    private AboutUsCardRepository aboutUsCardRepo;

    private static final String UPLOAD_DIR = "uploads/about-us/";
    private static final String GALLERY_UPLOAD_DIR = "uploads/gallery/";

    @GetMapping("/settings")
    public ResponseEntity<?> getSettings() {
        List<AboutUsSettings> settings = aboutUsRepo.findAll();
        if (settings.isEmpty()) {
            return ResponseEntity.ok(new AboutUsSettings());
        }
        return ResponseEntity.ok(settings.get(0));
    }

    @PutMapping("/settings")
    public ResponseEntity<?> updateSettings(@RequestBody AboutUsSettings settings) {
        List<AboutUsSettings> existing = aboutUsRepo.findAll();
        AboutUsSettings toSave;

        if (existing.isEmpty()) {
            toSave = settings;
        } else {
            toSave = existing.get(0);
            toSave.setStudioName(settings.getStudioName());
            toSave.setTagline(settings.getTagline());
            toSave.setAboutText(settings.getAboutText());
            toSave.setPassionText(settings.getPassionText());
            toSave.setAddress(settings.getAddress());
            toSave.setEmail(settings.getEmail());
            toSave.setPhone(settings.getPhone());
            toSave.setClassTypesInfo(settings.getClassTypesInfo());
            toSave.setSkillLevelsInfo(settings.getSkillLevelsInfo());
            toSave.setDanceStylesInfo(settings.getDanceStylesInfo());
            toSave.setTrainingPlanText(settings.getTrainingPlanText());
            toSave.setKidsProgramText(settings.getKidsProgramText());
            toSave.setTeenClassesText(settings.getTeenClassesText());
            toSave.setAdultClassesText(settings.getAdultClassesText());
            toSave.setCompetitionTeamText(settings.getCompetitionTeamText());
            toSave.setPrivateLessonsText(settings.getPrivateLessonsText());
            // Also update image paths if provided
            if (settings.getImage1Path() != null)
                toSave.setImage1Path(settings.getImage1Path());
            if (settings.getImage2Path() != null)
                toSave.setImage2Path(settings.getImage2Path());
            if (settings.getImage3Path() != null)
                toSave.setImage3Path(settings.getImage3Path());
        }

        toSave.setUpdatedAt(LocalDateTime.now());
        aboutUsRepo.save(toSave);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Settings updated successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/upload-image/{imageNumber}")
    public ResponseEntity<?> uploadImage(@PathVariable int imageNumber, @RequestParam("file") MultipartFile file) {
        try {
            // Create upload directory if it doesn't exist
            File uploadDir = new File(UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".tmp";
            String filename = "image" + imageNumber + "_" + UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = Paths.get(UPLOAD_DIR + filename);
            Files.write(filePath, file.getBytes());

            // Update database
            List<AboutUsSettings> settings = aboutUsRepo.findAll();
            AboutUsSettings toUpdate;

            if (settings.isEmpty()) {
                toUpdate = new AboutUsSettings();
            } else {
                toUpdate = settings.get(0);
            }

            String relativePath = "about-us/" + filename;
            switch (imageNumber) {
                case 1:
                    toUpdate.setImage1Path(relativePath);
                    break;
                case 2:
                    toUpdate.setImage2Path(relativePath);
                    break;
                case 3:
                    toUpdate.setImage3Path(relativePath);
                    break;
                default:
                    return ResponseEntity.badRequest().body("Invalid image number");
            }

            toUpdate.setUpdatedAt(LocalDateTime.now());
            aboutUsRepo.save(toUpdate);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("imagePath", relativePath);
            response.put("message", "Image uploaded successfully");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/values")
    public ResponseEntity<?> getCoreValues() {
        List<CoreValue> values = coreValueRepo.findAll();
        return ResponseEntity.ok(values);
    }

    @PostMapping("/values")
    public ResponseEntity<?> createCoreValue(@RequestBody CoreValue value) {
        CoreValue saved = coreValueRepo.save(value);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", saved);
        response.put("message", "Core value created successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/values/{id}")
    public ResponseEntity<?> updateCoreValue(@PathVariable Long id, @RequestBody CoreValue value) {
        if (!coreValueRepo.existsById(id)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Core value not found");
            return ResponseEntity.status(404).body(response);
        }

        value.setId(id);
        CoreValue updated = coreValueRepo.save(value);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        response.put("message", "Core value updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/values/{id}")
    public ResponseEntity<?> deleteCoreValue(@PathVariable Long id) {
        if (!coreValueRepo.existsById(id)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Core value not found");
            return ResponseEntity.status(404).body(response);
        }

        coreValueRepo.deleteById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Core value deleted successfully");
        return ResponseEntity.ok(response);
    }

    // Event Gallery Endpoints
    @GetMapping("/gallery")
    public ResponseEntity<?> getGalleryItems() {
        List<EventGallery> items = eventGalleryRepo.findAll();
        return ResponseEntity.ok(items);
    }

    @PostMapping("/gallery")
    public ResponseEntity<?> createGalleryItem(@RequestParam("eventName") String eventName,
            @RequestParam("description") String description,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "category", required = false, defaultValue = "GENERAL") String category,
            @RequestParam(value = "displayOrder", required = false, defaultValue = "0") Integer displayOrder) {
        try {
            // Create upload directory if it doesn't exist
            File uploadDir = new File(GALLERY_UPLOAD_DIR);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".tmp";
            String filename = "event_" + UUID.randomUUID().toString() + extension;

            // Save file
            Path filePath = Paths.get(GALLERY_UPLOAD_DIR + filename);
            Files.write(filePath, file.getBytes());

            // Create gallery item
            EventGallery item = new EventGallery();
            item.setEventName(eventName);
            item.setDescription(description);
            item.setImagePath("gallery/" + filename);
            item.setUploadedAt(LocalDateTime.now());
            item.setCategory(category);
            item.setDisplayOrder(displayOrder);
            item.setActive(true);

            EventGallery saved = eventGalleryRepo.save(item);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", saved);
            response.put("message", "Gallery item created successfully");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Failed to upload image: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    @PutMapping("/gallery/{id}")
    public ResponseEntity<?> updateGalleryItem(@PathVariable Long id,
            @RequestParam("eventName") String eventName,
            @RequestParam("description") String description,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "displayOrder", required = false) Integer displayOrder) {
        if (!eventGalleryRepo.existsById(id)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Gallery item not found");
            return ResponseEntity.status(404).body(response);
        }

        EventGallery item = eventGalleryRepo.findById(id).get();
        item.setEventName(eventName);
        item.setDescription(description);
        if (displayOrder != null) {
            item.setDisplayOrder(displayOrder);
        }
        if (category != null) {
            item.setCategory(category);
        }

        EventGallery updated = eventGalleryRepo.save(item);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        response.put("message", "Gallery item updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/gallery/{id}")
    public ResponseEntity<?> deleteGalleryItem(@PathVariable Long id) {
        if (!eventGalleryRepo.existsById(id)) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "Gallery item not found");
            return ResponseEntity.status(404).body(response);
        }

        eventGalleryRepo.deleteById(id);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Gallery item deleted successfully");
        return ResponseEntity.ok(response);
    }

    // About Us Cards Endpoints
    @GetMapping("/cards")
    public ResponseEntity<?> getCards() {
        List<AboutUsCard> cards = aboutUsCardRepo.findAllByOrderByDisplayOrderAsc();
        return ResponseEntity.ok(cards);
    }

    @PostMapping("/cards")
    public ResponseEntity<?> createCard(@RequestBody AboutUsCard card) {
        AboutUsCard saved = aboutUsCardRepo.save(card);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", saved);
        response.put("message", "Card created successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/cards/{id}")
    public ResponseEntity<?> updateCard(@PathVariable Long id, @RequestBody AboutUsCard card) {
        if (!aboutUsCardRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        card.setId(id);
        AboutUsCard updated = aboutUsCardRepo.save(card);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", updated);
        response.put("message", "Card updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/cards/{id}")
    public ResponseEntity<?> deleteCard(@PathVariable Long id) {
        if (!aboutUsCardRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        aboutUsCardRepo.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Card deleted successfully");
        return ResponseEntity.ok(response);
    }
}
