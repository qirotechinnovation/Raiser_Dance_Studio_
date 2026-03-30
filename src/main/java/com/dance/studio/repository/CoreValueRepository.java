package com.dance.studio.repository;

import com.dance.studio.model.CoreValue;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CoreValueRepository extends JpaRepository<CoreValue, Long> {
    List<CoreValue> findByActiveTrueOrderByDisplayOrderAsc();
}
