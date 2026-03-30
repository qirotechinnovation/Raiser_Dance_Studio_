package com.dance.studio.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class StudioInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String mobile;
    private String address;
    private String email;

    // Enquiry Details
    private String danceType; // e.g. "Hip Hop"
    private String skillLevel; // e.g. "Beginner"
    private String preferredBatchTime; // e.g. "Morning 7-8"
    private String inquiryDate; // String constraint from existing pattern or LocalDateTime

    @Column(length = 1000)
    private String notes;

    private String status = "OPEN"; // OPEN, CONVERTED, CLOSED

    private LocalDateTime createdAt;

    public StudioInquiry() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getDanceType() {
        return danceType;
    }

    public void setDanceType(String danceType) {
        this.danceType = danceType;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public String getPreferredBatchTime() {
        return preferredBatchTime;
    }

    public void setPreferredBatchTime(String preferredBatchTime) {
        this.preferredBatchTime = preferredBatchTime;
    }

    public String getInquiryDate() {
        return inquiryDate;
    }

    public void setInquiryDate(String inquiryDate) {
        this.inquiryDate = inquiryDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
