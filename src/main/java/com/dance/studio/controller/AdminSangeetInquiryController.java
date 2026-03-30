package com.dance.studio.controller;

import com.dance.studio.model.Event;
import com.dance.studio.model.Fee;
import com.dance.studio.model.Student;
import com.dance.studio.repository.EventRepository;
import com.dance.studio.repository.FeeRepository;
import com.dance.studio.repository.SangeetInquiryRepository;
import com.dance.studio.model.SangeetInquiry;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/admin/sangeet/inquiries")
@CrossOrigin
public class AdminSangeetInquiryController {

    private final SangeetInquiryRepository repo;
    private final EventRepository eventRepo;
    private final FeeRepository feeRepo;

    public AdminSangeetInquiryController(SangeetInquiryRepository repo, EventRepository eventRepo,
            FeeRepository feeRepo) {
        this.repo = repo;
        this.eventRepo = eventRepo;
        this.feeRepo = feeRepo;
    }

    @GetMapping
    public List<SangeetInquiry> all() {
        return repo.findAll();
    }

    @PutMapping("/{id}")
    public SangeetInquiry update(@PathVariable long id, @RequestBody SangeetInquiry details) {
        SangeetInquiry inquiry = repo.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setClientName(details.getClientName());
        inquiry.setMobile(details.getMobile());
        inquiry.setEventDate(details.getEventDate());
        inquiry.setStatus(details.getStatus());
        inquiry.setPackageOfInterest(details.getPackageOfInterest());
        inquiry.setRemarks(details.getRemarks());

        inquiry.setFeeAmount(details.getFeeAmount());
        inquiry.setBrideName(details.getBrideName());
        inquiry.setGroomName(details.getGroomName());
        return repo.save(inquiry);
    }

    @PutMapping("/{id}/status")
    public SangeetInquiry updateStatus(@PathVariable long id, @RequestParam String status) {
        SangeetInquiry inquiry = repo.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setStatus(status);
        return repo.save(inquiry);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable long id) {
        repo.deleteById(id);
        return "Inquiry deleted";
    }

    @PutMapping("/{id}/accept")
    public SangeetInquiry accept(@PathVariable long id) {
        SangeetInquiry inquiry = repo.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setStatus("ACCEPTED");
        return repo.save(inquiry);
    }

    @PutMapping("/{id}/decline")
    public SangeetInquiry decline(@PathVariable long id) {
        SangeetInquiry inquiry = repo.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setStatus("DECLINED");
        return repo.save(inquiry);
    }

    @PostMapping("/{id}/confirm-payment")
    public SangeetInquiry confirmPayment(@PathVariable long id) {
        SangeetInquiry inquiry = repo.findById(id).orElseThrow(() -> new RuntimeException("Inquiry not found"));

        // 1. Update Inquiry
        inquiry.setPaymentStatus("PAID");
        inquiry.setStatus("BOOKED");
        repo.save(inquiry);

        // 2. Create Event
        Event event = new Event();
        event.setTitle("Wedding Choreo: " + inquiry.getClientName());
        event.setVenue("TBD"); // Default venue
        event.setDate(inquiry.getEventDate());
        event.setType("WEDDING_CHOREO");
        event.setDescription("Wedding choreography package: "
                + (inquiry.getPackageOfInterest() != null ? inquiry.getPackageOfInterest().getName() : "Custom"));

        // Add student as participant if available
        if (inquiry.getStudent() != null) {
            List<Student> participants = new ArrayList<>();
            participants.add(inquiry.getStudent());
            event.setParticipants(participants);
        }

        eventRepo.save(event);

        // 3. Create Fee Record for Financial History
        if (inquiry.getStudent() != null && inquiry.getFeeAmount() != null) {
            Fee fee = new Fee();
            fee.setStudent(inquiry.getStudent());
            fee.setAmount(inquiry.getFeeAmount());
            fee.setPaidDate(LocalDate.now());
            fee.setDueDate(LocalDate.now());
            fee.setStatus("PAID");
            fee.setPaymentMode("ONLINE"); // Since receipt was uploaded via app
            fee.setPlan("Wedding Choreo: "
                    + (inquiry.getPackageOfInterest() != null ? inquiry.getPackageOfInterest().getName() : "Custom"));
            fee.setRemarks("Wedding Choreography payment confirmed via inquiry #" + inquiry.getId());
            feeRepo.save(fee);
        }

        return inquiry;
    }
}
