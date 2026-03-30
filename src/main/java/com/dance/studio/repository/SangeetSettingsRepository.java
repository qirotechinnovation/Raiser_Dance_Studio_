package com.dance.studio.repository;

import com.dance.studio.model.SangeetSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SangeetSettingsRepository extends JpaRepository<SangeetSettings, Long> {
}
