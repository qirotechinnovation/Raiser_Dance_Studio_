package com.dance.studio.repository;

import com.dance.studio.model.SangeetPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SangeetPackageRepository extends JpaRepository<SangeetPackage, Long> {
}
