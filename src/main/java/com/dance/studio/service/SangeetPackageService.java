package com.dance.studio.service;

import com.dance.studio.model.SangeetPackage;
import com.dance.studio.repository.SangeetPackageRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class SangeetPackageService {

    private final SangeetPackageRepository repo;

    public SangeetPackageService(SangeetPackageRepository repo) {
        this.repo = repo;
    }

    // CREATE
    public SangeetPackage save(SangeetPackage pkg) {
        return repo.save(pkg);
    }

    // READ ALL
    public List<SangeetPackage> findAll() {
        return repo.findAll();
    }

    // READ BY ID
    public SangeetPackage findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("SangeetPackage not found with id " + id));
    }

    // UPDATE
    public SangeetPackage update(Long id, SangeetPackage pkg) {
        SangeetPackage existing = findById(id);

        existing.setName(pkg.getName());
        existing.setPrice(pkg.getPrice());
        existing.setDetails(pkg.getDetails());
        existing.setNumberOfDances(pkg.getNumberOfDances());
        existing.setTheme(pkg.getTheme());
        existing.setBillingCycle(pkg.getBillingCycle());
        existing.setDuration(pkg.getDuration());
        existing.setChoreographerList(pkg.getChoreographerList());
        existing.setPopular(pkg.isPopular());
        existing.setDisplayOrder(pkg.getDisplayOrder());
        existing.setImage(pkg.getImage());

        return repo.save(existing);
    }

    // DELETE
    public void delete(Long id) {
        repo.deleteById(id);
    }
}
