package com.dance.studio.repository;

import com.dance.studio.model.StudioInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface StudioInquiryRepository extends JpaRepository<StudioInquiry, Long> {
    List<StudioInquiry> findAllByOrderByCreatedAtDesc();
}
