package com.dance.studio.service;

import com.dance.studio.model.Batch;
import com.dance.studio.repository.BatchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@SuppressWarnings("null")
public class BatchService {

    private final BatchRepository repo;

    public BatchService(BatchRepository repo) {
        this.repo = repo;
    }

    public Batch save(Batch batch) {
        return repo.save(batch);
    }

    public List<Batch> findAll() {
        return repo.findAll();
    }

    public Batch findById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Batch not found with id " + id));
    }

    public Batch update(Long id, Batch batch) {
        Batch existing = findById(id);

        existing.setName(batch.getName());
        existing.setTiming(batch.getTiming());
        existing.setDays(batch.getDays());
        existing.setDanceType(batch.getDanceType());

        return repo.save(existing);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
