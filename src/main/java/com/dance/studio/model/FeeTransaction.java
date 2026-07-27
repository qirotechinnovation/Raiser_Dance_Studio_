package com.dance.studio.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "fee_transactions")
public class FeeTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "fee_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Fee fee;

    private double amountPaid;
    private LocalDate paidDate;
    private String paymentMode;
    private String transactionId;
    private String receiptNo;

    public FeeTransaction() {
    }

    public FeeTransaction(Fee fee, double amountPaid, LocalDate paidDate, String paymentMode, String transactionId, String receiptNo) {
        this.fee = fee;
        this.amountPaid = amountPaid;
        this.paidDate = paidDate;
        this.paymentMode = paymentMode;
        this.transactionId = transactionId;
        this.receiptNo = receiptNo;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Fee getFee() { return fee; }
    public void setFee(Fee fee) { this.fee = fee; }
    
    public double getAmountPaid() { return amountPaid; }
    public void setAmountPaid(double amountPaid) { this.amountPaid = amountPaid; }
    
    public LocalDate getPaidDate() { return paidDate; }
    public void setPaidDate(LocalDate paidDate) { this.paidDate = paidDate; }
    
    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }
    
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    
    public String getReceiptNo() { return receiptNo; }
    public void setReceiptNo(String receiptNo) { this.receiptNo = receiptNo; }
}
