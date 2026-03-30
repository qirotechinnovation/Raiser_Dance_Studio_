package com.dance.studio.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.dance.studio.model.DanceType;
import com.dance.studio.repository.DanceTypeRepository;

@RestController
@RequestMapping("/admin/dance-types")
@CrossOrigin
@SuppressWarnings("null")
public class DanceTypeController {

    private final DanceTypeRepository repo;

    public DanceTypeController(DanceTypeRepository repo) {
        this.repo = repo;
    }

    @PostMapping
    public DanceType add(@RequestBody DanceType d) {
        return repo.save(d);
    }

    @GetMapping
    public List<DanceType> all() {
        return repo.findAll();
    }

    @PutMapping("/{id}")
    public DanceType update(@PathVariable Long id, @RequestBody DanceType d) {
        return repo.findById(id).map(existing -> {
            existing.setName(d.getName());
            existing.setActive(d.isActive());
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("DanceType not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
