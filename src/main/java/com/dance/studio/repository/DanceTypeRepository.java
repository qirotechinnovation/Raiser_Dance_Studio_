package com.dance.studio.repository;

import com.dance.studio.model.DanceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface DanceTypeRepository extends JpaRepository<DanceType, Long> {
    List<DanceType> findByActiveTrue();
    boolean existsByNameIgnoreCase(String name);
}

