package com.dance.studio.controller;

import com.dance.studio.model.StudioInquiry;
import com.dance.studio.repository.StudioInquiryRepository;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/admin/inquiries")
@CrossOrigin
@SuppressWarnings("null")
public class StudioInquiryController {

    private final StudioInquiryRepository repo;

    public StudioInquiryController(StudioInquiryRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public StudioInquiry create(@RequestBody StudioInquiry inquiry) {
        if (inquiry.getCreatedAt() == null) {
            inquiry.setCreatedAt(LocalDateTime.now());
        }
        return repo.save(inquiry);
    }

    @GetMapping
    public List<StudioInquiry> getAll() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    @PutMapping("/{id}/status")
    public StudioInquiry updateStatus(@PathVariable Long id, @RequestParam String status) {
        return repo.findById(id).map(inq -> {
            inq.setStatus(status);
            return repo.save(inq);
        }).orElseThrow(() -> new RuntimeException("Inquiry not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
