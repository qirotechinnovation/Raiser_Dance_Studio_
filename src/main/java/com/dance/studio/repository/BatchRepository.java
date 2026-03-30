package com.dance.studio.repository;

import com.dance.studio.model.Batch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List; // Added import for List

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    long countByActiveTrue();

    long countByDaysContaining(String day);

    java.util.List<Batch> findByActive(boolean active);

    List<Batch> findByDaysContaining(String day);

    long countByDaysContainingIgnoreCase(String day);

    List<Batch> findByDaysContainingIgnoreCase(String day);
}
