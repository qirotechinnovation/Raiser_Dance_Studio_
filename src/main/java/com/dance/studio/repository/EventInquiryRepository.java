package com.dance.studio.repository;

import com.dance.studio.model.EventInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventInquiryRepository extends JpaRepository<EventInquiry, Long> {
    List<EventInquiry> findByStudentIdOrderByTimestampDesc(Long studentId);

    List<EventInquiry> findByStatusOrderByTimestampDesc(String status);

    long countByStatus(String status);

    List<EventInquiry> findByStudentIdAndEventId(Long studentId, Long eventId);
}
