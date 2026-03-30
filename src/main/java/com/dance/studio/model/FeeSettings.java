package com.dance.studio.model;

import jakarta.persistence.*;

@Entity
@Table(name = "fee_settings")
public class FeeSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private double admissionFee = 200.0;
    private double monthlyFee = 1600.0;
    private double quarterlyFee = 4500.0;
    private double halfYearlyFee = 8500.0;
    private double yearlyFee = 16000.0;
    private double privateClassFee = 1000.0;
    private double discountPercent = 0.0;

    @Column(columnDefinition = "TEXT")
    private String feeNotes;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public double getAdmissionFee() {
        return admissionFee;
    }

    public void setAdmissionFee(double admissionFee) {
        this.admissionFee = admissionFee;
    }

    public double getMonthlyFee() {
        return monthlyFee;
    }

    public void setMonthlyFee(double monthlyFee) {
        this.monthlyFee = monthlyFee;
    }

    public double getQuarterlyFee() {
        return quarterlyFee;
    }

    public void setQuarterlyFee(double quarterlyFee) {
        this.quarterlyFee = quarterlyFee;
    }

    public double getHalfYearlyFee() {
        return halfYearlyFee;
    }

    public void setHalfYearlyFee(double halfYearlyFee) {
        this.halfYearlyFee = halfYearlyFee;
    }

    public double getYearlyFee() {
        return yearlyFee;
    }

    public void setYearlyFee(double yearlyFee) {
        this.yearlyFee = yearlyFee;
    }

    public double getPrivateClassFee() {
        return privateClassFee;
    }

    public void setPrivateClassFee(double privateClassFee) {
        this.privateClassFee = privateClassFee;
    }

    public double getDiscountPercent() {
        return discountPercent;
    }

    public void setDiscountPercent(double discountPercent) {
        this.discountPercent = discountPercent;
    }

    public String getFeeNotes() {
        return feeNotes;
    }

    public void setFeeNotes(String feeNotes) {
        this.feeNotes = feeNotes;
    }
}
