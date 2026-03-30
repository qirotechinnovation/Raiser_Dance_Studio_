package com.dance.studio.controller;

import com.dance.studio.model.FeeStructure;
import com.dance.studio.repository.FeeStructureRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/public/fee-structure")
@CrossOrigin
public class PublicFeeStructureController {

    private final FeeStructureRepository repository;

    public PublicFeeStructureController(FeeStructureRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<FeeStructure> getAll() {
        return repository.findAll();
    }
}
