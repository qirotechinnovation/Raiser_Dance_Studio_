package com.dance.studio.repository;

import com.dance.studio.model.FeeSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FeeSettingsRepository extends JpaRepository<FeeSettings, Long> {
}
