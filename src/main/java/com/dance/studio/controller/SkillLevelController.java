package com.dance.studio.controller;

import com.dance.studio.model.SkillLevel;
import com.dance.studio.repository.SkillLevelRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/skill-levels")
@CrossOrigin
@SuppressWarnings("null")
public class SkillLevelController {

    private final SkillLevelRepository repo;

    public SkillLevelController(SkillLevelRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<SkillLevel> getAll() {
        return repo.findAll();
    }

    @PostMapping
    public SkillLevel create(@RequestBody SkillLevel level) {
        return repo.save(level);
    }

    @PutMapping("/{id}")
    public SkillLevel update(@PathVariable Long id, @RequestBody SkillLevel updated) {
        return repo.findById(id).map(existing -> {
            existing.setName(updated.getName());
            existing.setActive(updated.isActive());
            return repo.save(existing);
        }).orElseThrow(() -> new RuntimeException("SkillLevel not found"));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repo.deleteById(id);
    }
}
