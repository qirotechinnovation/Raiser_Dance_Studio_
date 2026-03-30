package com.dance.studio.repository;

import com.dance.studio.model.BatchEnrollmentInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface BatchEnrollmentRepository extends JpaRepository<BatchEnrollmentInquiry, Long> {
    List<BatchEnrollmentInquiry> findByStudentIdOrderByTimestampDesc(Long studentId);

    List<BatchEnrollmentInquiry> findByStatusOrderByTimestampDesc(String status);

    List<BatchEnrollmentInquiry> findByBatchIdAndStatus(Long batchId, String status);

    long countByStatus(String status);
}
