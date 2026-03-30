package com.dance.studio.repository;

import com.dance.studio.model.SangeetInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SangeetInquiryRepository extends JpaRepository<SangeetInquiry, Long> {
    List<SangeetInquiry> findByStatus(String status);

    long countByStatus(String status);

    List<SangeetInquiry> findByStudentId(Long studentId);
}
