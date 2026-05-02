package com.dance.studio.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private int age;

    private String email; // ✅ NEW

    private String password; // ✅ NEW

    private String parentMobile;
    private String address;
    private String taluka; // ✅ NEW
    private String district; // ✅ NEW
    private String state; // ✅ NEW
    private String pincode; // ✅ NEW
    private String nationality; // ✅ NEW
    private String parentRelation; // ✅ NEW (Brother, Dad, Mom, Other)
    private double totalOutstanding; // ✅ NEW

    private String skillLevel;
    private String classType;
    private String progressLevel; // e.g. "On Track", "Needs Practice"
    private String profilePic; // Filename of the profile picture

    private LocalDate joiningDate;
    private boolean active = true;

    private String registrationFeeStatus = "PENDING"; // PENDING, PAID, VERIFICATION_PENDING

    @ManyToOne
    private Batch batch;

    @ManyToOne
    private DanceType danceType;

    // ===== Getters & Setters =====

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

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getParentMobile() {
        return parentMobile;
    }

    public void setParentMobile(String parentMobile) {
        this.parentMobile = parentMobile;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getTaluka() {
        return taluka;
    }

    public void setTaluka(String taluka) {
        this.taluka = taluka;
    }

    public String getDistrict() {
        return district;
    }

    public void setDistrict(String district) {
        this.district = district;
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }

    public String getNationality() {
        return nationality;
    }

    public void setNationality(String nationality) {
        this.nationality = nationality;
    }

    public String getParentRelation() {
        return parentRelation;
    }

    public void setParentRelation(String parentRelation) {
        this.parentRelation = parentRelation;
    }

    public double getTotalOutstanding() {
        return totalOutstanding;
    }

    public void setTotalOutstanding(double totalOutstanding) {
        this.totalOutstanding = totalOutstanding;
    }

    public String getSkillLevel() {
        return skillLevel;
    }

    public void setSkillLevel(String skillLevel) {
        this.skillLevel = skillLevel;
    }

    public String getClassType() {
        return classType;
    }

    public void setClassType(String classType) {
        this.classType = classType;
    }

    public String getProgressLevel() {
        return progressLevel;
    }

    public void setProgressLevel(String progressLevel) {
        this.progressLevel = progressLevel;
    }

    public LocalDate getJoiningDate() {
        return joiningDate;
    }

    public void setJoiningDate(LocalDate joiningDate) {
        this.joiningDate = joiningDate;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Batch getBatch() {
        return batch;
    }

    public void setBatch(Batch batch) {
        this.batch = batch;
    }

    public DanceType getDanceType() {
        return danceType;
    }

    public void setDanceType(DanceType danceType) {
        this.danceType = danceType;
    }

    private String feePlan; // Monthly, Quarterly, Yearly
    private double admissionFee; // e.g. 200

    @Column(length = 1000)
    private String notes; // Admin notes

    public String getFeePlan() {
        return feePlan;
    }

    public void setFeePlan(String feePlan) {
        this.feePlan = feePlan;
    }

    public double getAdmissionFee() {
        return admissionFee;
    }

    public void setAdmissionFee(double admissionFee) {
        this.admissionFee = admissionFee;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getProfilePic() {
        return profilePic;
    }

    public void setProfilePic(String profilePic) {
        this.profilePic = profilePic;
    }

    public String getRegistrationFeeStatus() {
        return registrationFeeStatus;
    }

    public void setRegistrationFeeStatus(String registrationFeeStatus) {
        this.registrationFeeStatus = registrationFeeStatus;
    }
}
