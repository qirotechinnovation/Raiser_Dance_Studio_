package com.dance.studio.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "fees")
public class Fee {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private double amount;
	private double discountPercent;
	private String plan;
	private String status;
	private String feeType; // ADMISSION or MONTHLY
	private String feeMonth; // e.g. "January 2024"
	private String batchName; // ✅ NEW

	private LocalDate dueDate;
	private LocalDate paidDate;

	private String transactionId;
	private String paymentMode;
	private String remarks;
	private LocalDate lastReminderSent;
	private String receiptNo;

	@ManyToOne
	@JoinColumn(name = "student_id")
	private Student student;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public double getAmount() {
		return amount;
	}

	public void setAmount(double amount) {
		this.amount = amount;
	}

	public double getDiscountPercent() {
		return discountPercent;
	}

	public void setDiscountPercent(double discountPercent) {
		this.discountPercent = discountPercent;
	}

	public void setPlan(String plan) {
		this.plan = plan;
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

	public LocalDate getPaidDate() {
		return paidDate;
	}

	public void setPaidDate(LocalDate paidDate) {
		this.paidDate = paidDate;
	}

	public Student getStudent() {
		return student;
	}

	public Fee(Long id, double amount, double discountPercent, String plan, String status, String feeType, String feeMonth, LocalDate dueDate,
			LocalDate paidDate, Student student, String transactionId, String paymentMode, String remarks,
			LocalDate lastReminderSent, String receiptNo) {
		super();
		this.id = id;
		this.amount = amount;
		this.discountPercent = discountPercent;
		this.plan = plan;
		this.status = status;
		this.feeType = feeType;
		this.feeMonth = feeMonth;
		this.dueDate = dueDate;
		this.paidDate = paidDate;
		this.student = student;
		this.transactionId = transactionId;
		this.paymentMode = paymentMode;
		this.remarks = remarks;
		this.lastReminderSent = lastReminderSent;
		this.receiptNo = receiptNo;
	}

	public Fee() {
	}

	public void setStudent(Student student) {
		this.student = student;
	}

	public String getPlan() {
		return plan;
	}

	public String getTransactionId() {
		return transactionId;
	}

	public void setTransactionId(String transactionId) {
		this.transactionId = transactionId;
	}

	public String getPaymentMode() {
		return paymentMode;
	}

	public void setPaymentMode(String paymentMode) {
		this.paymentMode = paymentMode;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public LocalDate getLastReminderSent() {
		return lastReminderSent;
	}

	public void setLastReminderSent(LocalDate lastReminderSent) {
		this.lastReminderSent = lastReminderSent;
	}

	public String getReceiptNo() {
		return receiptNo;
	}

	public void setReceiptNo(String receiptNo) {
		this.receiptNo = receiptNo;
	}

	public String getFeeType() {
		return feeType;
	}

	public void setFeeType(String feeType) {
		this.feeType = feeType;
	}

	public String getFeeMonth() {
		return feeMonth;
	}

	public void setFeeMonth(String feeMonth) {
		this.feeMonth = feeMonth;
	}

	public String getBatchName() {
		return batchName;
	}

	public void setBatchName(String batchName) {
		this.batchName = batchName;
	}
}
