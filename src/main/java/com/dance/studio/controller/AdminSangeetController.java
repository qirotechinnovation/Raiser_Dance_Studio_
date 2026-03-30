package com.dance.studio.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.dance.studio.model.SangeetPackage;
import com.dance.studio.repository.SangeetPackageRepository;

@RestController
@RequestMapping("/admin/sangeet/packages")
@CrossOrigin
@SuppressWarnings("null")
public class AdminSangeetController {

    private final SangeetPackageRepository repo;

    public AdminSangeetController(SangeetPackageRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public SangeetPackage add(@RequestBody SangeetPackage p) {
        return repo.save(p);
    }

    @GetMapping
    public List<SangeetPackage> all() {
        return repo.findAll();
    }

    @PutMapping("/{id}")
    public SangeetPackage update(@PathVariable Long id, @RequestBody SangeetPackage p) {
        return repo.findById(id).map(existing -> {
            existing.setName(p.getName());
            existing.setPrice(p.getPrice());
            existing.setDetails(p.getDetails());
            existing.setNumberOfDances(p.getNumberOfDances());
            existing.setTheme(p.getTheme());
            existing.setDuration(p.getDuration());
            existing.setChoreographerList(p.getChoreographerList());
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("Package not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
