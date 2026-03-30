package com.dance.studio.controller;

import com.dance.studio.model.FeeStructure;
import com.dance.studio.repository.FeeStructureRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/fee-structure")
@CrossOrigin
@SuppressWarnings("null")
public class AdminFeeStructureController {

    private final FeeStructureRepository repository;

    public AdminFeeStructureController(FeeStructureRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<FeeStructure> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public FeeStructure create(@RequestBody FeeStructure feeStructure) {
        return repository.save(feeStructure);
    }

    @PutMapping("/{id}")
    public FeeStructure update(@PathVariable Long id, @RequestBody FeeStructure updated) {
        return repository.findById(id).map(existing -> {
            existing.setCategory(updated.getCategory());
            existing.setPlan(updated.getPlan());
            existing.setClasses(updated.getClasses());
            existing.setAmount(updated.getAmount());
            existing.setDiscountPercent(updated.getDiscountPercent());
            return repository.save(existing);
        }).orElseThrow(() -> new RuntimeException("FeeStructure not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
