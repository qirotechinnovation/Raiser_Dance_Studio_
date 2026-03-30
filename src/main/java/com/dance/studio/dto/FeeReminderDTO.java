package com.dance.studio.dto;

import java.time.LocalDate;

public class FeeReminderDTO {

    private Long studentId;
    private String studentName;
    private String parentMobile;

    private double amount;
    private String feePlan;        
    private String status;         
    private LocalDate dueDate;

    private String message;       

    // ✅ Constructors
    public FeeReminderDTO() {
    }

    public FeeReminderDTO(
            Long studentId,
            String studentName,
            String parentMobile,
            double amount,
            String feePlan,
            String status,
            LocalDate dueDate,
            String message
    ) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.parentMobile = parentMobile;
        this.amount = amount;
        this.feePlan = feePlan;
        this.status = status;
        this.dueDate = dueDate;
        this.message = message;
    }



	// ✅ Getters & Setters
    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getParentMobile() {
        return parentMobile;
    }

    public void setParentMobile(String parentMobile) {
        this.parentMobile = parentMobile;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getFeePlan() {
        return feePlan;
    }

    public void setFeePlan(String feePlan) {
        this.feePlan = feePlan;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
