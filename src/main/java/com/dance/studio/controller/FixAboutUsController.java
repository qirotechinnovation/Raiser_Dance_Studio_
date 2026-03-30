package com.dance.studio.controller;

import com.dance.studio.model.AboutUsSettings;
import com.dance.studio.repository.AboutUsSettingsRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@RestController
public class FixAboutUsController {

    private final AboutUsSettingsRepository repository;

    public FixAboutUsController(AboutUsSettingsRepository repository) {
        this.repository = repository;
    }

    @GetMapping("/fix-about-us")
    @Transactional
    public String fixAboutUs() {
        try {
            List<AboutUsSettings> all = repository.findAll();
            AboutUsSettings settings = all.isEmpty() ? new AboutUsSettings() : all.get(0);

            settings.setStudioName("Raiser’s studio");
            settings.setTagline("A PLACE TO LEARN, GROW, AND EXPRESS THROUGH DANCE!");
            settings.setAboutText(
                    "Raiser's Dance Studio is more than just a place to learn dance—it's a space where passion rises, confidence grows, and talent is transformed into excellence. Founded with the vision to raise dancers and shape performers, our studio is dedicated to nurturing creativity, discipline, and self-expression through the art of dance.");
            settings.setPassionText(
                    "Our passion lies in raising confidence, creativity, and character through dance. We believe dance is a universal language that tells stories, heals emotions, and builds strong individuals. Every beat we count, every move we teach, and every performance we create is driven by love for the art. We strive to inspire our students to dream big, work hard, and rise stronger - on stage and in life.");

            settings.setClassTypesInfo(
                    "• Bollywood class: Bollywood Dance time 5:00 to 6:00 evening. Energetic, expressive, and fun-filled, inspired by the latest and classic Bollywood songs.\n"
                            +
                            "• Special kids class: Monday-Friday time 6:00 to 7:00 evening. Designed to nurture young talent in a fun, safe, and supportive environment.\n"
                            +
                            "• Beginner class: Monday-Friday time 7:00 to 8:00. Specially designed for students who are new to dance or want to build strong basics.\n"
                            +
                            "• Advance class: Monday-Friday time 8:00 to 9:00 evening. Contemporary Dance style that blends classical, modern, and lyrical movement.");

            settings.setSkillLevelsInfo(
                    "• Beginner Level: Perfect for students new to dance. Focus: Basic body movements, rhythm, timing, and posture.\n"
                            +
                            "• Intermediate Level: For dancers with basic training. Focus: Improved technique, complex choreography, and performance skills.\n"
                            +
                            "• Advanced Level: For experienced dancers. Focus: Precision, freestyle, competition training, and professional stage shows.");

            settings.setEmail("Raisersdancestudio@gmail.com");
            settings.setPhone("9503399763");
            settings.setAddress("Office plot no70 sector E cidco n4 chh.sambhajinagar");
            settings.setUpdatedAt(LocalDateTime.now());

            repository.save(settings);
            return "About Us content updated successfully with Brochure data!";
        } catch (Exception e) {
            return "Failed to update About Us: " + e.getMessage();
        }
    }
}
