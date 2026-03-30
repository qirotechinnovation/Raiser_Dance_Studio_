package com.dance.studio.controller;

import com.dance.studio.model.SangeetPackage;
import com.dance.studio.service.SangeetPackageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/sangeet-packages")
@CrossOrigin
public class SangeetPackageController {

    private final SangeetPackageService service;

    public SangeetPackageController(SangeetPackageService service) {
        this.service = service;
    }

    // CREATE
    @PostMapping
    public SangeetPackage create(@RequestBody SangeetPackage pkg) {
        return service.save(pkg);
    }

    // GET ALL
    @GetMapping
    public List<SangeetPackage> getAll() {
        return service.findAll();
    }

    // GET BY ID
    @GetMapping("/{id}")
    public SangeetPackage getById(@PathVariable Long id) {
        return service.findById(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public SangeetPackage update(@PathVariable Long id, @RequestBody SangeetPackage pkg) {
        return service.update(id, pkg);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
