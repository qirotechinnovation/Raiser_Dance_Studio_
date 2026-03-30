package com.dance.studio.controller;

import com.dance.studio.model.Fee;
import com.dance.studio.service.FeeService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController

@CrossOrigin
public class FeeController {

    private final FeeService service;

    public FeeController(FeeService service) {
        this.service = service;
    }

    // ✅ CREATE FEE
    @PostMapping
    public Fee create(@RequestBody Fee fee) {
        return service.createFee(fee);
    }

    // ✅ MARK PAID
    @PutMapping("/{id}/paid")
    public Fee markPaid(@PathVariable Long id) {
        return service.markPaid(id);
    }

    // ✅ VIEW ALL PENDING FEES
    @GetMapping("/pending")
    public List<Fee> pending() {
        return service.pendingFees();
    }

    // ✅ FEES DUE (AUTO REMINDER)
    @GetMapping("/due")
    public List<Fee> dueFees() {
        return service.dueFees();
    }
}
