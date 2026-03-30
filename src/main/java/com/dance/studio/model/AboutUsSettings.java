package com.dance.studio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class AboutUsSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String studioName;
    private String tagline;

    @Column(columnDefinition = "TEXT")
    private String aboutText;

    @Column(columnDefinition = "TEXT")
    private String passionText;

    @Column(columnDefinition = "TEXT")
    private String classTypesInfo;

    @Column(columnDefinition = "TEXT")
    private String skillLevelsInfo;

    @Column(columnDefinition = "TEXT")
    private String danceStylesInfo;

    @Column(columnDefinition = "TEXT")
    private String trainingPlanText;

    @Column(columnDefinition = "TEXT")
    private String kidsProgramText;

    @Column(columnDefinition = "TEXT")
    private String teenClassesText;

    @Column(columnDefinition = "TEXT")
    private String adultClassesText;

    @Column(columnDefinition = "TEXT")
    private String competitionTeamText;

    @Column(columnDefinition = "TEXT")
    private String privateLessonsText;

    private String email;
    private String phone;
    private String address;

    private String image1Path;
    private String image2Path;
    private String image3Path;

    private LocalDateTime updatedAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getStudioName() {
        return studioName;
    }

    public void setStudioName(String studioName) {
        this.studioName = studioName;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getAboutText() {
        return aboutText;
    }

    public void setAboutText(String aboutText) {
        this.aboutText = aboutText;
    }

    public String getPassionText() {
        return passionText;
    }

    public void setPassionText(String passionText) {
        this.passionText = passionText;
    }

    public String getClassTypesInfo() {
        return classTypesInfo;
    }

    public void setClassTypesInfo(String classTypesInfo) {
        this.classTypesInfo = classTypesInfo;
    }

    public String getSkillLevelsInfo() {
        return skillLevelsInfo;
    }

    public void setSkillLevelsInfo(String skillLevelsInfo) {
        this.skillLevelsInfo = skillLevelsInfo;
    }

    public String getDanceStylesInfo() {
        return danceStylesInfo;
    }

    public void setDanceStylesInfo(String danceStylesInfo) {
        this.danceStylesInfo = danceStylesInfo;
    }

    public String getTrainingPlanText() {
        return trainingPlanText;
    }

    public void setTrainingPlanText(String trainingPlanText) {
        this.trainingPlanText = trainingPlanText;
    }

    public String getKidsProgramText() {
        return kidsProgramText;
    }

    public void setKidsProgramText(String kidsProgramText) {
        this.kidsProgramText = kidsProgramText;
    }

    public String getTeenClassesText() {
        return teenClassesText;
    }

    public void setTeenClassesText(String teenClassesText) {
        this.teenClassesText = teenClassesText;
    }

    public String getAdultClassesText() {
        return adultClassesText;
    }

    public void setAdultClassesText(String adultClassesText) {
        this.adultClassesText = adultClassesText;
    }

    public String getCompetitionTeamText() {
        return competitionTeamText;
    }

    public void setCompetitionTeamText(String competitionTeamText) {
        this.competitionTeamText = competitionTeamText;
    }

    public String getPrivateLessonsText() {
        return privateLessonsText;
    }

    public void setPrivateLessonsText(String privateLessonsText) {
        this.privateLessonsText = privateLessonsText;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getImage1Path() {
        return image1Path;
    }

    public void setImage1Path(String image1Path) {
        this.image1Path = image1Path;
    }

    public String getImage2Path() {
        return image2Path;
    }

    public void setImage2Path(String image2Path) {
        this.image2Path = image2Path;
    }

    public String getImage3Path() {
        return image3Path;
    }

    public void setImage3Path(String image3Path) {
        this.image3Path = image3Path;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
