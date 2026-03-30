package com.dance.studio.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class SangeetInquiry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String clientName;
    private String mobile;
    private LocalDate eventDate;
    private String status = "PENDING"; // PENDING, ACCEPTED, DECLINED, BOOKED
    private String paymentStatus = "UNPAID"; // UNPAID, PAID
    private String remarks;

    private Double feeAmount; // The amount admin asks for
    private String paymentProof; // Screenshot path
    private String brideName;
    private String groomName;

    @ManyToOne
    private Student student;

    @ManyToOne
    private SangeetPackage packageOfInterest;

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public LocalDate getEventDate() {
        return eventDate;
    }

    public void setEventDate(LocalDate eventDate) {
        this.eventDate = eventDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public SangeetPackage getPackageOfInterest() {
        return packageOfInterest;
    }

    public void setPackageOfInterest(SangeetPackage pkg) {
        this.packageOfInterest = pkg;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public Double getFeeAmount() {
        return feeAmount;
    }

    public void setFeeAmount(Double feeAmount) {
        this.feeAmount = feeAmount;
    }

    public String getPaymentProof() {
        return paymentProof;
    }

    public void setPaymentProof(String paymentProof) {
        this.paymentProof = paymentProof;
    }

    public String getBrideName() {
        return brideName;
    }

    public void setBrideName(String brideName) {
        this.brideName = brideName;
    }

    public String getGroomName() {
        return groomName;
    }

    public void setGroomName(String groomName) {
        this.groomName = groomName;
    }
}
