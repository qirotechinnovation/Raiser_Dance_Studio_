package com.dance.studio.config;

import com.dance.studio.model.FeeStructure;
import com.dance.studio.model.SangeetPackage;
import com.dance.studio.model.DanceType;
import com.dance.studio.model.SkillLevel;
import com.dance.studio.model.AboutUsSettings;

import com.dance.studio.repository.FeeStructureRepository;
import com.dance.studio.repository.SangeetPackageRepository;
import com.dance.studio.repository.DanceTypeRepository;
import com.dance.studio.repository.SkillLevelRepository;
import com.dance.studio.repository.AboutUsSettingsRepository;
import com.dance.studio.repository.CoreValueRepository;
import com.dance.studio.repository.AboutUsCardRepository;
import com.dance.studio.model.AboutUsCard;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.LocalDateTime;
import java.util.Arrays;

@Configuration
@SuppressWarnings("null")
public class DataInitializer {

        @Bean
        CommandLineRunner initDatabase(FeeStructureRepository feeRepo, SangeetPackageRepository sangeetRepo,
                        DanceTypeRepository danceTypeRepo, SkillLevelRepository skillLevelRepo,
                        AboutUsSettingsRepository aboutUsRepo, CoreValueRepository coreValueRepo,
                        AboutUsCardRepository aboutUsCardRepo,
                        com.dance.studio.repository.SangeetSettingsRepository sangeetSettingsRepo) {
                return args -> {
                        // Initialize Sangeet Settings
                        if (sangeetSettingsRepo.count() == 0) {
                                com.dance.studio.model.SangeetSettings ss = new com.dance.studio.model.SangeetSettings();
                                ss.setPageTitle("Wedding Choreography");
                                ss.setHeroText("Making you look like dancing stars is our only goal");
                                ss.setSubHeroText(
                                                "We Put a Lot Of Thought & Work into creating each piece of choreography, specially customised for & according to our clients");
                                ss.setAboutTitle("Short About Our Raiser’s");
                                ss.setAboutContent(
                                                "We create Custamised Choreographies BY TEAM RAISER’S. From rehearsals to performing on stage are with our clients every step of the way. New Ideas Concept.");
                                ss.setContactPhone("9503399763");
                                ss.setStudioAddress("Office plot no70 sector E cidco n4 chh.sambhajinagar");
                                sangeetSettingsRepo.save(ss);
                        }

                        // Initialize Fee Structures
                        if (feeRepo.count() == 0) {
                                feeRepo.saveAll(Arrays.asList(
                                                // Kids Fees Structure
                                                createFS("Kids", "Monthly", "20 classes", 1400.0, 0.0),
                                                createFS("Kids", "Quarterly", "60 classes", 4200.0, 10.0),
                                                createFS("Kids", "Half-year", "120 classes", 8400.0, 15.0),
                                                createFS("Kids", "Yearly", "240 classes", 16800.0, 20.0),

                                                // Beginners / Intermediate / Bollywood
                                                createFS("Regular", "Monthly", "20 classes", 1600.0, 0.0),
                                                createFS("Regular", "Quarterly", "60 classes", 4800.0, 10.0),
                                                createFS("Regular", "Half-year", "120 classes", 9600.0, 15.0),
                                                createFS("Regular", "Yearly", "240 classes", 19200.0, 20.0),

                                                // Private classes
                                                createFS("Private", "Monthly", "20 classes", 4500.0, 0.0),
                                                createFS("Private", "Quarterly", "60 classes", 13500.0, 10.0),
                                                createFS("Private", "Half-year", "120 classes", 27000.0, 15.0),
                                                createFS("Private", "Yearly", "240 classes", 54000.0, 20.0)));
                        }

                        // Initialize Wedding Choreography Packages
                        if (sangeetRepo.count() == 0) {
                                sangeetRepo.saveAll(Arrays.asList(
                                                createPackage("Basic Package", 50000.0,
                                                                "One Choreographer will teach you, Basic and Simple Steps, Props Use, Fusion songs, Learn at your Home or at our Dance Studio, Duration: Each dance is up to 3 minutes long, Covers 10 Dances",
                                                                10, "Classic & Simple", "ANNUAL",
                                                                "Up to 3 minutes", false, 1),

                                                createPackage("Silver Package", 65000.0,
                                                                "One Male and One Female Choreographers will teach you, Theme Dance (Rajni Blockbuster), Basic and Advanced Choreographies, Solo Duet and Family Dance, Special Bride and Groom Performance, Surprise Performance, Special Kids Choreographies, Stage Marking, Learn at your Home or at our Dance Studio, Per Song Up to 5 Minutes Duration, Covers 10 Dances",
                                                                10, "Themed & Advanced", "ANNUAL",
                                                                "Up to 5 minutes", true, 2),

                                                createPackage("Gold Package", 90000.0,
                                                                "Three Choreographers (2M 1F), Professional Background Dancers, Custom Costumes Included, High-End Thematic Performances, Stage Special Effects Coordination, Duration: Up to 7 minutes per dance, Total: 10 Dances",
                                                                10, "Elite & Grand", "ANNUAL",
                                                                "Up to 7 minutes", false, 3)));
                        }

                        // Initialize Dance Types (Dance Styles from Brochure)
                        if (danceTypeRepo.count() == 0) {
                                danceTypeRepo.saveAll(Arrays.asList(
                                                createDanceType("Bollywood Dance"),
                                                createDanceType("Hip-Hop Dance"),
                                                createDanceType("Semi-Classical Dance"),
                                                createDanceType("Contemporary Dance"),
                                                createDanceType("Fusion Dance")));
                        }

                        // Initialize Skill Levels
                        if (skillLevelRepo.count() == 0) {
                                skillLevelRepo.saveAll(Arrays.asList(
                                                createSkillLevel("Beginner"),
                                                createSkillLevel("Intermediate"),
                                                createSkillLevel("Advanced")));
                        }

                        // Initialize About Us Settings
                        if (aboutUsRepo.count() == 0) {
                                AboutUsSettings settings = new AboutUsSettings();
                                settings.setStudioName("Raiser's Dance Studio");
                                settings.setTagline("Where Passion Rises & Talent Transforms");
                                settings.setAboutText(
                                                "Raiser's Dance Studio is more than just a place to learn dance it's a space where passion rises, "
                                                                + "confidence grows, and talent is transformed into excellence. Founded with the vision to raise dancers "
                                                                + "and shape performers, our studio is dedicated to nurturing creativity, discipline, and self-expression "
                                                                + "through the art of dance.");
                                settings.setPassionText(
                                                "Our Passion\nOur passion lies in raising confidence, creativity, and character through dance. We believe dance is a universal language that tells "
                                                                + "stories, heals emotions, and builds strong individuals.\n\n"
                                                                + "Every beat we count, every move we teach, and every performance we create is driven by love for the art. "
                                                                + "We strive to inspire our students to dream big, work hard, and rise stronger - on stage and in life.");

                                settings.setClassTypesInfo(
                                                "1. Bollywood Class (5:00 - 6:00 PM)\n" +
                                                                "Energetic, expressive, and fun-filled, inspired by the latest and classic Bollywood songs. "
                                                                +
                                                                "These classes focus on rhythm, expressions, confidence, and performance skills, making them perfect for all age groups.\n\n"
                                                                +
                                                                "2. Special Kids Class (Mon-Fri, 6:00 - 7:00 PM)\n" +
                                                                "Classes designed to nurture young talent in a fun, safe, and supportive environment. "
                                                                +
                                                                "We focus on building confidence, coordination, creativity, and discipline while making dance enjoyable for every child.\n\n"
                                                                +
                                                                "3. Beginner Class (Mon-Fri, 7:00 - 8:00 PM)\n" +
                                                                "Specially designed for students who are new to dance or want to build strong basics. "
                                                                +
                                                                "No prior dance experience is required — just passion and willingness to learn.\n\n"
                                                                +
                                                                "4. Advance Class (Mon-Fri, 8:00 - 9:00 PM)\n" +
                                                                "Contains Contemporary Dance elements, focusing on emotion, storytelling, fluidity, and freedom. "
                                                                +
                                                                "Allows dancers to connect deeply with music and express feelings through movement.");

                                settings.setSkillLevelsInfo(
                                                "Beginner Level:\n" +
                                                                "• Perfect for students who are new to dance.\n" +
                                                                "• Focus: Basic body movements, coordination, rhythm, timing, musicality, simple choreography, and confidence building.\n\n"
                                                                +
                                                                "Intermediate Level:\n" +
                                                                "• For dancers with basic knowledge and training experience.\n"
                                                                +
                                                                "• Focus: Improved technique, movement control, complex choreography, formations, strength, flexibility, and expressions.\n\n"
                                                                +
                                                                "Advanced Level:\n" +
                                                                "• Designed for experienced and dedicated dancers.\n" +
                                                                "• Focus: Advanced techniques, precision, freestyle, creativity, personal style, high-energy choreography, and professional training.");

                                settings.setDanceStylesInfo(
                                                "Bollywood Dance:\n" +
                                                                "A vibrant and energetic dance style inspired by Indian cinema. It is a beautiful fusion of classical "
                                                                +
                                                                "Indian dance forms, folk styles, and modern influences like hip-hop and contemporary.\n\n"
                                                                +
                                                                "Hip-Hop Dance:\n" +
                                                                "A powerful, high-energy street dance style known for its freedom, attitude, and rhythm. "
                                                                +
                                                                "Hip-hop allows dancers to express their personality and creativity through strong movements.\n\n"
                                                                +
                                                                "Semi-Classical Dance:\n" +
                                                                "A graceful fusion of traditional Indian classical dance forms and modern expressions. "
                                                                +
                                                                "Combines beauty, discipline, and storytelling with the freedom and flow of contemporary movements.");

                                settings.setTrainingPlanText(
                                                "At Raiser’s Dance Studio, our training plan is designed to build strong foundations, technical excellence, "
                                                                +
                                                                "and confident performers. Each session focuses on physical training, creativity, and performance development.");

                                settings.setKidsProgramText(
                                                "Creative Fun: We don’t just teach steps — we create memories, friendships, and confidence that last a lifetime.\n"
                                                                +
                                                                "Safe Space: A fun, positive, and caring environment where every little dancer feels safe, happy, and free to be themselves.\n"
                                                                +
                                                                "Easy Steps: We teach easy steps that make dancing fun for everyone!");

                                settings.setTeenClassesText(
                                                "Our Teen Dance Classes at Raiser’s Dance Studio are designed to channel energy, creativity, and confidence into powerful movement. "
                                                                +
                                                                "These classes help teens build strong dance foundations while expressing their individuality and style. "
                                                                +
                                                                "With a perfect balance of technique, fitness, and performance, we train teens to grow as confident dancers both on and off the stage.");

                                settings.setAdultClassesText(
                                                "At Raiser’s Dance Studio, our adult dance classes are designed for anyone who loves dance — "
                                                                +
                                                                "whether you’re a beginner, returning after a break, or looking to stay fit in a fun way. Age is never a barrier when passion leads the way. "
                                                                +
                                                                "Our classes focus on fitness, confidence, stress relief, and self-expression, creating a positive and energetic environment where adults can enjoy learning at their own pace.");

                                settings.setCompetitionTeamText(
                                                "Team Spirit: Team spirit is the heart of everything we do. Great performances are created when dancers support, "
                                                                +
                                                                "respect, and grow together as one team.\n" +
                                                                "Show Skills: Our culture encourages unity, discipline, motivation, and mutual respect. Every success is celebrated together.");

                                settings.setPrivateLessonsText(
                                                "Designed for individuals who want personalized attention, faster improvement, and customized learning. "
                                                                +
                                                                "These one-on-one or small-group sessions focus entirely on your goals, pace, and preferred dance style. "
                                                                +
                                                                "Perfect for competition preparation, performance, audition, or personal skill development.");
                                settings.setEmail("Raisersdancestudio@gmail.com");
                                settings.setPhone("9503399763");
                                settings.setAddress("Office plot no70 sector E cidco n4 chh.sambhajinagar");
                                settings.setUpdatedAt(LocalDateTime.now());
                                aboutUsRepo.save(settings);
                        }

                        // Initialize About Us Cards
                        if (aboutUsCardRepo.count() == 0) {
                                aboutUsCardRepo.saveAll(Arrays.asList(
                                                new AboutUsCard("About Us & Our Passion",
                                                                "Raiser's Dance Studio is more than just a place to learn dance it's a space where passion rises, confidence grows, and talent is transformed into excellence. Founded with the vision to raise dancers and shape performers, our studio is dedicated to nurturing creativity, discipline, and self-expression through the art of dance.\n\nOur Passion\nOur passion lies in raising confidence, creativity, and character through dance. We believe dance is a universal language that tells stories, heals emotions, and builds strong individuals.\n\nEvery beat we count, every move we teach, and every performance we create is driven by love for the art. We strive to inspire our students to dream big, work hard, and rise stronger - on stage and in life.",
                                                                "heart-pulse", 1)));
                        }
                };
        }

        private FeeStructure createFS(String category, String plan, String classes, double amount, double discount) {
                FeeStructure fs = new FeeStructure();
                fs.setCategory(category);
                fs.setPlan(plan);
                fs.setClasses(classes);
                fs.setAmount(amount);
                fs.setDiscountPercent(discount);
                return fs;
        }

        private SangeetPackage createPackage(String name, double price, String details,
                        int numberOfDances, String theme, String billingCycle, String duration, boolean isPopular,
                        int order) {
                SangeetPackage pkg = new SangeetPackage();
                pkg.setName(name);
                pkg.setPrice(price);
                pkg.setDetails(details);
                pkg.setNumberOfDances(numberOfDances);
                pkg.setTheme(theme);
                pkg.setBillingCycle(billingCycle);
                pkg.setDuration(duration);
                pkg.setPopular(isPopular);
                pkg.setDisplayOrder(order);
                return pkg;
        }

        private DanceType createDanceType(String name) {
                DanceType dt = new DanceType();
                dt.setName(name);
                dt.setActive(true);
                return dt;
        }

        private SkillLevel createSkillLevel(String name) {
                SkillLevel sl = new SkillLevel();
                sl.setName(name);
                sl.setActive(true);
                return sl;
        }


}
